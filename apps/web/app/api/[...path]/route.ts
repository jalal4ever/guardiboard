import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

async function proxyRequest(
  path: string,
  method: string,
  body?: any
) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('gb_session');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (sessionCookie) {
    headers['Authorization'] = `Bearer ${sessionCookie.value}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  return {
    status: response.status,
    data,
  };
}

export async function GET(request: NextRequest, { params }: { params: { path: string } }) {
  const { status, data } = await proxyRequest(`/${params.path}`, 'GET');
  return NextResponse.json(data, { status });
}

export async function POST(request: NextRequest, { params }: { params: { path: string } }) {
  const body = await request.json();
  const { status, data } = await proxyRequest(`/${params.path}`, 'POST', body);
  return NextResponse.json(data, { status });
}

export async function PATCH(request: NextRequest, { params }: { params: { path: string } }) {
  const body = await request.json();
  const { status, data } = await proxyRequest(`/${params.path}`, 'PATCH', body);
  return NextResponse.json(data, { status });
}

export async function DELETE(request: NextRequest, { params }: { params: { path: string } }) {
  const { status, data } = await proxyRequest(`/${params.path}`, 'DELETE');
  return NextResponse.json(data, { status });
}
