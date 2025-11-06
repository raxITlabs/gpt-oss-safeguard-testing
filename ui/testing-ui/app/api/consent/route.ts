import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { consentSchema } from '@/lib/consent-validation';
import { saveConsentToStorage } from '@/lib/consent-storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input with Zod
    const validatedData = consentSchema.parse(body);

    // Get or create session
    const response = NextResponse.json({ success: true });
    const session = await getIronSession<SessionData>(request, response, sessionOptions);

    // Get IP address for audit trail
    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // Store session data
    session.user = {
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      email: validatedData.email.toLowerCase(),
    };

    session.consents = {
      privacy: validatedData.acceptPrivacy as boolean,
      terms: validatedData.acceptTerms as boolean,
      safety: validatedData.acceptSafety as boolean,
    };

    session.metadata = {
      acceptedAt: new Date().toISOString(),
      ipAddress,
    };

    session.isAccepted = true;

    // Save session (sets encrypted cookie)
    await session.save();

    console.log('✅ Session created for:', session.user.email);

    // Save to CSV for lead tracking (async, non-blocking)
    saveConsentToStorage({
      firstName: session.user.firstName,
      lastName: session.user.lastName,
      email: session.user.email,
      acceptedAt: session.metadata.acceptedAt,
      ipAddress: session.metadata.ipAddress,
    }).catch((error) => {
      console.error('⚠️ Failed to save to storage (non-critical):', error);
    });

    return response;
  } catch (error) {
    console.error('❌ Consent submission error:', error);

    // Handle Zod validation errors
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed. Please check your input.',
          errors: error,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred while processing your request. Please try again.',
      },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint to check if user has already consented
export async function GET(request: NextRequest) {
  try {
    const response = NextResponse.json({ hasConsented: false });
    const session = await getIronSession<SessionData>(request, response, sessionOptions);

    return NextResponse.json({
      hasConsented: session.isAccepted || false,
      user: session.isAccepted ? session.user : null,
    });
  } catch (error) {
    console.error('❌ Session check error:', error);
    return NextResponse.json({ hasConsented: false });
  }
}
