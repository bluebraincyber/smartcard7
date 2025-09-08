import { NextResponse } from 'next/server';
import { auth } from '@/auth';


export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    console.log('Testing signin for:', email);
    
    // Obter as opções do NextAuth
    const session = await auth();
    console.log('Auth options built');
    console.log('Auth session:', session);
    
    // Encontrar o provider de credentials
    const credentialsProvider = authOptions.providers?.find(
      (provider: ) => provider.type === 'credentials'
    );
    
    console.log('Credentials provider found:', !!credentialsProvider);
    console.log('Provider type:', credentialsProvider?.type);
    console.log('Has authorize function:', typeof (credentialsProvider as )?.authorize);
    
    if (!credentialsProvider) {
      return NextResponse.json({ error: 'Credentials provider not found' }, { status: 500 });
    }
    
    // Testar a função authorize diretamente
    let result = null;
    let error = null;
    
    try {
       console.log('Calling authorize function...');
       console.log('About to call authorize with:', { email, password });
       
       result = await (credentialsProvider as ).authorize(
         { email, password },
         {} // req object (não usado)
       );
       
       console.log('Authorize completed, result:', result);
       console.log('Result type:', typeof result);
    } catch (err) {
      console.error('Authorize error:', err);
      error = err instanceof Error ? err.message : 'Unknown error';
    }
    
    return NextResponse.json({
      success: !!result,
      user: result,
      error: error,
      debug: {
        hasResult: !!result,
        resultType: typeof result,
        resultKeys: result ? Object.keys(result) : null,
        hadError: !!error
      }
    });
    
  } catch (error) {
    console.error('Test signin error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}