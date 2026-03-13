'use client';

import { Card } from '@/components/ui/Card';

interface ScoreWidgetProps {
  title: string;
  score: number;
  change?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export function ScoreWidget({ title, score, change, variant = 'default' }: ScoreWidgetProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'danger':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{score}%</p>
          {change && (
            <div className="mt-2 flex items-center text-sm">
              <span className="text-green-600">{change}</span>
              <span className="ml-2 text-slate-500">depuis 30 jours</span>
            </div>
          )}
        </div>
        <div className={`h-12 w-12 rounded-full flex items-center justify-center ${getVariantStyles()}`}>
          <span className="text-lg">✓</span>
        </div>
      </div>
    </Card>
  );
}

interface FindingsWidgetProps {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export function FindingsWidget({ critical, high, medium, low }: FindingsWidgetProps) {
  const total = critical + high + medium + low;

  return (
    <Card>
      <h3 className="text-sm font-medium text-slate-500 mb-4">Findings</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            <span className="text-sm text-slate-700">Critical</span>
          </div>
          <span className="text-sm font-semibold text-slate-900">{critical}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            <span className="text-sm text-slate-700">High</span>
          </div>
          <span className="text-sm font-semibold text-slate-900">{high}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
            <span className="text-sm text-slate-700">Medium</span>
          </div>
          <span className="text-sm font-semibold text-slate-900">{medium}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span className="text-sm text-slate-700">Low</span>
          </div>
          <span className="text-sm font-semibold text-slate-900">{low}</span>
        </div>
        <div className="pt-3 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-900">Total</span>
            <span className="text-sm font-bold text-slate-900">{total}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

interface ConnectorStatusWidgetProps {
  connectors: Array<{
    name: string;
    status: 'active' | 'error' | 'pending';
    lastSync: string;
  }>;
}

export function ConnectorStatusWidget({ connectors }: ConnectorStatusWidgetProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <Card>
      <h3 className="text-sm font-medium text-slate-500 mb-4">Connecteurs</h3>
      <div className="space-y-3">
        {connectors.map((connector, idx) => (
          <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
            <div>
              <p className="text-sm font-medium text-slate-900">{connector.name}</p>
              <p className="text-xs text-slate-500">{connector.lastSync}</p>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(connector.status)}`}>
              {connector.status}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
