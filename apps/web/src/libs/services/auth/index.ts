'use client';

import { http, ENDPOINTS } from '@/libs/api';
import type {
  AuthResponse,
  AvailabilityResponse,
  ChangePasswordDto,
  CheckAvailabilityDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  SessionResponse,
  SignInDto,
  SignUpDto,
  VerifyEmailDto,
} from '@kalya/types';

/**
 * Authentication Service
 *
 * Implements static methods for all authentication and account security operations,
 * communicating with the backend API and handling credentials, sessions, and recovery workflows.
 */
export class AuthService {
  /**
   * Signs in a user using either email or username credentials.
   */
  static async signIn(dto: SignInDto): Promise<AuthResponse> {
    const isEmail = dto.identifier.includes('@');
    const endpoint = isEmail ? ENDPOINTS.AUTH.SIGN_IN_EMAIL : ENDPOINTS.AUTH.SIGN_IN_USERNAME;

    const payload = isEmail
      ? {
          email: dto.identifier.trim().toLowerCase(),
          password: dto.password,
          rememberMe: dto.rememberMe ?? false,
        }
      : {
          username: dto.identifier.trim().toLowerCase(),
          password: dto.password,
          rememberMe: dto.rememberMe ?? false,
        };

    return http.post<AuthResponse>(endpoint, payload);
  }

  /**
   * Initiates Google OAuth sign-in flow.
   *
   * Posts to Better-Auth's /sign-in/social endpoint, which sets state cookies
   * and returns the Google OAuth consent authorization URL. The browser then redirects.
   */
  static async signInWithGoogle(options?: {
    callbackURL?: string;
    newUserCallbackURL?: string;
    errorCallbackURL?: string;
  }): Promise<void> {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const toAbsolute = (url?: string, fallback = '') => {
      const target = url || fallback;
      return target.startsWith('http://') || target.startsWith('https://')
        ? target
        : `${origin}${target.startsWith('/') ? target : `/${target}`}`;
    };

    const res = await http.post<{ url?: string; redirect?: boolean }>(
      ENDPOINTS.AUTH.SIGN_IN_SOCIAL,
      {
        provider: 'google',
        callbackURL: toAbsolute(options?.callbackURL, '/dashboard'),
        newUserCallbackURL: toAbsolute(options?.newUserCallbackURL, '/dashboard'),
        errorCallbackURL: toAbsolute(options?.errorCallbackURL, '/auth/sign-in?error=oauth_failed'),
      }
    );

    if (res?.url) {
      window.location.href = res.url;
    }
  }

  /**
   * Initiates Google OAuth sign-up flow.
   *
   * Similar to signInWithGoogle, but signals registration intent and directs
   * newly registered users to profile completion / onboarding if desired.
   */
  static async signUpWithGoogle(options?: {
    callbackURL?: string;
    newUserCallbackURL?: string;
    errorCallbackURL?: string;
  }): Promise<void> {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const toAbsolute = (url?: string, fallback = '') => {
      const target = url || fallback;
      return target.startsWith('http://') || target.startsWith('https://')
        ? target
        : `${origin}${target.startsWith('/') ? target : `/${target}`}`;
    };

    const res = await http.post<{ url?: string; redirect?: boolean }>(
      ENDPOINTS.AUTH.SIGN_IN_SOCIAL,
      {
        provider: 'google',
        requestSignUp: true,
        callbackURL: toAbsolute(options?.callbackURL, '/dashboard'),
        newUserCallbackURL: toAbsolute(options?.newUserCallbackURL, '/onboarding'),
        errorCallbackURL: toAbsolute(options?.errorCallbackURL, '/auth/sign-up?error=oauth_failed'),
      }
    );

    if (res?.url) {
      window.location.href = res.url;
    }
  }

  /**
   * Registers a new user account with full domain profile fields.
   */
  static async signUp(dto: SignUpDto): Promise<AuthResponse> {
    const payload = {
      email: dto.email.trim().toLowerCase(),
      password: dto.password,
      name: `${dto.first_name.trim()} ${dto.last_name.trim()}`.trim(),
      username: dto.username.trim().toLowerCase(),
      first_name: dto.first_name.trim(),
      last_name: dto.last_name.trim(),
      middle_name: dto.middle_name?.trim() || undefined,
      displayUsername: dto.displayUsername?.trim() || undefined,
      gender: dto.gender,
      dateOfBirth: dto.dateOfBirth,
      phone: dto.phone?.trim() || undefined,
      locale: dto.locale,
      timezone: dto.timezone,
      currency: dto.currency,
      image: dto.image,
      callbackURL: '/dashboard',
    };

    return http.post<AuthResponse>(ENDPOINTS.AUTH.SIGN_UP_EMAIL, payload);
  }

  /**
   * Terminates the active session and clears HTTP-only session cookies.
   */
  static async signOut(): Promise<void> {
    return http.post<void>(ENDPOINTS.AUTH.SIGN_OUT);
  }

  /**
   * Retrieves current authenticated session and user profile.
   * Returns null if unauthenticated or session expired.
   */
  static async getSession(): Promise<SessionResponse | null> {
    try {
      const data = await http.get<SessionResponse>(ENDPOINTS.AUTH.SESSION);
      if (!data || !data.user || !data.session) {
        return null;
      }
      return data;
    } catch (error) {
      // Re-throw so callers (e.g. AuthProvider) can distinguish between
      // network/server failures vs an explicit empty session response (HTTP 200 null)
      throw error;
    }
  }

  /**
   * Initiates password recovery workflow by dispatching a reset token to user's email.
   */
  static async forgotPassword(
    dto: ForgotPasswordDto
  ): Promise<{ message?: string; status?: boolean }> {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const redirectTo = dto.redirectTo
      ? dto.redirectTo.startsWith('http')
        ? dto.redirectTo
        : `${origin}${dto.redirectTo.startsWith('/') ? dto.redirectTo : `/${dto.redirectTo}`}`
      : `${origin}/auth/reset-password`;

    return http.post<{ message?: string; status?: boolean }>(ENDPOINTS.AUTH.FORGOT_PASSWORD, {
      email: dto.email.trim().toLowerCase(),
      redirectTo,
    });
  }

  /**
   * Completes password reset using verification token and new password.
   */
  static async resetPassword(
    dto: ResetPasswordDto
  ): Promise<{ message?: string; status?: boolean }> {
    return http.post<{ message?: string; status?: boolean }>(ENDPOINTS.AUTH.RESET_PASSWORD, {
      token: dto.token,
      newPassword: dto.newPassword,
    });
  }

  /**
   * Updates account password for an active authenticated user.
   */
  static async changePassword(
    dto: ChangePasswordDto
  ): Promise<{ message?: string; status?: boolean }> {
    return http.post<{ message?: string; status?: boolean }>(ENDPOINTS.AUTH.CHANGE_PASSWORD, dto);
  }

  /**
   * Verifies user email address using verification token.
   */
  static async verifyEmail(
    dto: VerifyEmailDto | string
  ): Promise<{ message?: string; status?: boolean }> {
    const token = typeof dto === 'string' ? dto : dto.token;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const callbackURL = `${origin}/auth/verify-email?status=verified`;

    return http.get<{ message?: string; status?: boolean }>(
      `${ENDPOINTS.AUTH.VERIFY_EMAIL}?token=${encodeURIComponent(token)}&callbackURL=${encodeURIComponent(callbackURL)}`
    );
  }

  /**
   * Dispatches or resends an account verification email link.
   */
  static async sendVerificationEmail(params: {
    email: string;
    callbackURL?: string;
  }): Promise<{ message?: string; status?: boolean }> {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const callbackURL = params.callbackURL
      ? params.callbackURL.startsWith('http')
        ? params.callbackURL
        : `${origin}${params.callbackURL.startsWith('/') ? params.callbackURL : `/${params.callbackURL}`}`
      : `${origin}/auth/verify-email?status=verified`;

    return http.post<{ message?: string; status?: boolean }>(
      ENDPOINTS.AUTH.SEND_VERIFICATION_EMAIL,
      {
        email: params.email.trim().toLowerCase(),
        callbackURL,
      }
    );
  }

  /**
   * Checks real-time availability of username or email address.
   */
  static async checkAvailability(params: CheckAvailabilityDto): Promise<AvailabilityResponse> {
    const query = new URLSearchParams({
      field: params.field,
      value: params.value.trim().toLowerCase(),
    }).toString();

    return http.get<AvailabilityResponse>(`${ENDPOINTS.AUTH.CHECK_AVAILABILITY}?${query}`);
  }

  /**
   * Checks real-time availability of a username handle.
   */
  static async checkUsernameAvailability(username: string): Promise<AvailabilityResponse> {
    return AuthService.checkAvailability({
      field: 'username',
      value: username,
    });
  }

  /**
   * Checks real-time availability of an email address.
   */
  static async checkEmailAvailability(email: string): Promise<AvailabilityResponse> {
    return AuthService.checkAvailability({
      field: 'email',
      value: email,
    });
  }
}
