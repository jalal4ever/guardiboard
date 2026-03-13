# Guardiboard AD Collector - Point d'entrée principal
# Version: 1.0.0
# Description: Collecteur de données Active Directory pour Guardiboard

param(
    [Parameter(Mandatory=$false)]
    [string]$ConfigPath = "$PSScriptRoot\config.json",
    
    [Parameter(Mandatory=$false)]
    [string]$ApiUrl = "https://api.guardiboard.com",
    
    [Parameter(Mandatory=$false)]
    [string]$CollectorId,
    
    [Parameter(Mandatory=$false)]
    [string]$EnrollmentToken
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$Script:CollectorVersion = "1.0.0"
$Script:CollectorId = $CollectorId
$Script:ApiUrl = $ApiUrl

function Write-Log {
    param(
        [string]$Message,
        [ValidateSet('INFO', 'WARN', 'ERROR', 'DEBUG')]
        [string]$Level = 'INFO'
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffZ"
    $logMessage = "[$timestamp] [$Level] $Message"
    
    switch ($Level) {
        'ERROR' { Write-Host $logMessage -ForegroundColor Red }
        'WARN'  { Write-Host $logMessage -ForegroundColor Yellow }
        'DEBUG' { Write-Host $logMessage -ForegroundColor Gray }
        default  { Write-Host $logMessage }
    }
}

function Initialize-Collector {
    Write-Log "Initialisation du collecteur Guardiboard v$Script:CollectorVersion"
    
    if (-not $Script:CollectorId) {
        Write-Log "CollectorId manquant - mode enroll" -Level WARN
        return $false
    }
    
    Write-Log "Collector ID: $Script:CollectorId"
    return $true
}

function Get-ADForestInfo {
    Write-Log "Collecte des informations de la forêt AD"
    
    try {
        $forest = Get-ADForest
        return @{
            forestName = $forest.Name
            domains = $forest.Domains
            domainMode = $forest.DomainMode
            forestMode = $forest.ForestMode
            schemaMaster = $forest.SchemaMaster
            infrastructureMaster = $forest.InfrastructureMaster
        }
    }
    catch {
        Write-Log "Erreur collecte forêt: $_" -Level ERROR
        return $null
    }
}

function Get-ADDomainInfo {
    Write-Log "Collecte des informations du domaine"
    
    try {
        $domain = Get-ADDomain
        return @{
            dnsRoot = $domain.DNSRoot
            netBIOSName = $domain.NetBIOSName
            domainMode = $domain.DomainMode
            pdcRoleOwner = $domain.PDCRoleOwner
            ridRoleOwner = $domain.RIDRoleOwner
        }
    }
    catch {
        Write-Log "Erreur collecte domaine: $_" -Level ERROR
        return $null
    }
}

function Get-ADUsersAtRisk {
    Write-Log "Collecte des utilisateurs à risque"
    
    $riskIndicators = @(
        @{ Name = "PasswordNotRequired"; Filter = "-PasswordNotRequired -eq `$true" }
        @{ Name = "PasswordNeverExpires"; Filter = "-PasswordNeverExpires -eq `$true" }
        @{ Name = "CannotChangePassword"; Filter = "-CannotChangePassword -eq `$true" }
        @{ Name = "AdminCount"; Filter = "-AdminCount -eq 1" }
    )
    
    $results = @()
    
    foreach ($indicator in $riskIndicators) {
        try {
            $users = Get-ADUser -Filter $indicator.Filter -Properties DisplayName, Enabled, PasswordLastSet, LastLogonDate, AdminCount -ResultSetSize 100
            $results += $users | Select-Object @{N='indicator';E={$indicator.Name}}, SamAccountName, DisplayName, Enabled, PasswordLastSet, LastLogonDate
        }
        catch {
            Write-Log "Erreur collecte $($indicator.Name): $_" -Level WARN
        }
    }
    
    return $results
}

function Get-ADPrivilegedGroups {
    Write-Log "Collecte des groupes privilégiés"
    
    $privilegedGroups = @(
        "Domain Admins",
        "Enterprise Admins",
        "Schema Admins",
        "Account Operators",
        "Server Operators",
        "DNS Admins",
        "DnsUpdateProxy",
        "Group Policy Creator Owners"
    )
    
    $results = @()
    
    foreach ($groupName in $privilegedGroups) {
        try {
            $group = Get-ADGroup -Filter { Name -eq $groupName } -Properties Members, Description -ErrorAction SilentlyContinue
            if ($group) {
                $results += @{
                    groupName = $group.Name
                    description = $group.Description
                    memberCount = $group.Members.Count
                    members = $group.Members | ForEach-Object { $_ }
                }
            }
        }
        catch {
            Write-Log "Erreur collecte groupe $groupName : $_" -Level WARN
        }
    }
    
    return $results
}

function Get-ADDelegation {
    Write-Log "Collecte de la délégation Kerberos"
    
    $results = @()
    
    try {
        $unconstrained = Get-ADComputer -Filter { TrustedForDelegation -eq $true } -Properties TrustedForDelegation, TrustedToAuthForDelegation -ResultSetSize 50
        $results += @{
            type = "unconstrained_delegation"
            count = $unconstrained.Count
            computers = $unconstrained | Select-Object Name, TrustedForDelegation
        }
    }
    catch {
        Write-Log "Erreur collecte delegation: $_" -Level WARN
    }
    
    return $results
}

function Get-ADComputerExposure {
    Write-Log "Collecte de l'exposition des machines"
    
    try {
        $computers = Get-ADComputer -Filter * -Properties OperatingSystem, OperatingSystemVersion, LastLogonDate, Enabled -ResultSetSize 100 | 
            Select-Object Name, OperatingSystem, OperatingSystemVersion, LastLogonDate, Enabled
        
        $osSummary = $computers | Group-Object OperatingSystem | Select-Object Name, Count
        
        return @{
            totalComputers = $computers.Count
            enabledComputers = ($computers | Where-Object { $_.Enabled }).Count
            osSummary = $osSummary
        }
    }
    catch {
        Write-Log "Erreur collecte ordinateurs: $_" -Level ERROR
        return $null
    }
}

function Send-DataToApi {
    param(
        [hashtable]$Data
    )
    
    Write-Log "Envoi des données vers l'API"
    
    try {
        $body = $Data | ConvertTo-Json -Depth 10
        $response = Invoke-RestMethod -Uri "$Script:ApiUrl/collectors/$Script:CollectorId/data" `
            -Method Post `
            -Body $body `
            -ContentType "application/json" `
            -TimeoutSec 30
        
        Write-Log "Données envoyées avec succès"
        return $true
    }
    catch {
        Write-Log "Erreur envoi données: $_" -Level ERROR
        return $false
    }
}

function Main {
    Write-Log "=========================================="
    Write-Log "Guardiboard AD Collector v$Script:CollectorVersion"
    Write-Log "=========================================="
    
    $initialized = Initialize-Collector
    
    if (-not $initialized) {
        Write-Log "Mode enrollment - contactez l'administrateur"
        return
    }
    
    $forestInfo = Get-ADForestInfo
    $domainInfo = Get-ADDomainInfo
    $usersAtRisk = Get-ADUsersAtRisk
    $privilegedGroups = Get-ADPrivilegedGroups
    $delegation = Get-ADDelegation
    $computerExposure = Get-ADComputerExposure
    
    $payload = @{
        collectorId = $Script:CollectorId
        collectedAt = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
        version = $Script:CollectorVersion
        forest = $forestInfo
        domain = $domainInfo
        usersAtRisk = $usersAtRisk
        privilegedGroups = $privilegedGroups
        delegation = $delegation
        computerExposure = $computerExposure
    }
    
    $sent = Send-DataToApi -Data $payload
    
    if ($sent) {
        Write-Log "Collecte terminée avec succès"
    }
    else {
        Write-Log "Échec de l'envoi des données" -Level ERROR
    }
}

Main
