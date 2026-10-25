import { ENDPOINTS, http } from '@/libs/api';
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
import { SecureStoreTokenService } from './token';

export class AuthService {
  /**
   * Signs in user using either email address or unique username handle.
   *
   * @description Detects whether the identifier is an email (contains '@') or username,
   * dispatches to the corresponding endpoint, and writes the returned session token
   * to hardware SecureStore.
   * @param {SignInDto} dto - Credentials payload including identifier, password, and rememberMe flag.
   * @returns {Promise<AuthResponse>} The authenticated user profile and session payload.
   */
  static async signIn(dto: SignInDto): Promise<AuthResponse> {
    const isEmail = dto.identifier.includes('@');
    const endpoint = isEmail ? ENDPOINTS.AUTH.SIGN_IN_EMAIL : ENDPOINTS.AUTH.SIGN_IN_USERNAME;

    const payload = isEmail
      ? {
          email: dto.identifier.trim().toLowerCase(),
          password: dto.password,
          rememberMe: dto.rememberMe ?? true,
        }
      : {
          username: dto.identifier.trim().toLowerCase(),
          password: dto.password,
          rememberMe: dto.rememberMe ?? true,
        };

    const res = await http.post<AuthResponse & { token?: string }>(endpoint, payload);

    if (res.token) {
      await SecureStoreTokenService.setToken(res.token);
    }

    return res;
  }

  /**
   * Registers a new user account with email credentials and profile details.
   *
   * @description Creates an account on the API server and persists the session token
   * to hardware SecureStore if returned.
   * @param {SignUpDto} dto - Registration payload with user profile, names, email, and password.
   * @returns {Promise<AuthResponse>} The created user profile and newly issued session.
   */
  static async signUp(dto: SignUpDto): Promise<AuthResponse> {
    const res = await http.post<AuthResponse & { token?: string }>(
      ENDPOINTS.AUTH.SIGN_UP_EMAIL,
      dto
    );

    if (res.token) {
      await SecureStoreTokenService.setToken(res.token);
    }

    return res;
  }

  /**
   * Terminates active session on the backend and wipes hardware storage.
   *
   * @description Dispatches sign-out request to Fastify/Better-Auth, ensuring
   * hardware SecureStore token deletion executes even if the network call fails.
   * @returns {Promise<void>} Resolves when session termination completes.
   */
  static async signOut(): Promise<void> {
    try {
      await http.post(ENDPOINTS.AUTH.SIGN_OUT);
    } finally {
      await SecureStoreTokenService.removeToken();
    }
  }

  /**
   * Retrieves and verifies the currently active session from the API server.
   *
   * @description Uses the injected Bearer token to fetch user profile and session metadata.
   * Returns null if unauthenticated or if the session has expired.
   * @returns {Promise<SessionResponse | null>} Resolved session context, or null if invalid.
   */
  static async getSession(): Promise<SessionResponse | null> {
    try {
      return await http.get<SessionResponse>(ENDPOINTS.AUTH.SESSION);
    } catch {
      return null;
    }
  }

  /**
   * Checks real-time availability of a username handle or email address.
   *
   * @description Queries the server availability verification endpoint.
   * @param {CheckAvailabilityDto} dto - Target field ('username' | 'email') and proposed value.
   * @returns {Promise<AvailabilityResponse>} Availability outcome with validation message.
   */
  static async checkAvailability(dto: CheckAvailabilityDto): Promise<AvailabilityResponse> {
    return http.post<AvailabilityResponse>(ENDPOINTS.AUTH.CHECK_AVAILABILITY, dto);
  }

  /**
   * Initiates password recovery by requesting a password reset email.
   *
   * @description Sends an account recovery instruction email with a reset token.
   * @param {ForgotPasswordDto} dto - Password reset request payload containing account email.
   * @returns {Promise<{ success: boolean; message?: string }>} Operation result status.
   */
  static async forgotPassword(
    dto: ForgotPasswordDto
  ): Promise<{ success: boolean; message?: string }> {
    return http.post<{ success: boolean; message?: string }>(ENDPOINTS.AUTH.FORGOT_PASSWORD, dto);
  }

  /**
   * Completes password reset using a verified reset token.
   *
   * @description Submits the new password along with the verification token received via email.
   * @param {ResetPasswordDto} dto - Reset payload with token and new password.
   * @returns {Promise<{ success: boolean; message?: string }>} Operation result status.
   */
  static async resetPassword(
    dto: ResetPasswordDto
  ): Promise<{ success: boolean; message?: string }> {
    return http.post<{ success: boolean; message?: string }>(ENDPOINTS.AUTH.RESET_PASSWORD, dto);
  }

  /**
   * Verifies an account email address using a verification token.
   *
   * @description Activates the user account email verification status.
   * @param {VerifyEmailDto} dto - Verification payload containing the email token.
   * @returns {Promise<{ success: boolean; message?: string }>} Verification result status.
   */
  static async verifyEmail(dto: VerifyEmailDto): Promise<{ success: boolean; message?: string }> {
    return http.post<{ success: boolean; message?: string }>(ENDPOINTS.AUTH.VERIFY_EMAIL, dto);
  }

  /**
   * Dispatches a fresh email verification link to the user's registered address.
   *
   * @description Re-sends activation instructions when verification token expired or was lost.
   * @param {string} email - Registered email address to receive the verification link.
   * @returns {Promise<{ success: boolean; message?: string }>} Operation result status.
   */
  static async sendVerificationEmail(
    email: string
  ): Promise<{ success: boolean; message?: string }> {
    return http.post<{ success: boolean; message?: string }>(
      ENDPOINTS.AUTH.SEND_VERIFICATION_EMAIL,
      { email }
    );
  }

  /**
   * Changes the password of an authenticated user.
   *
   * @description Verifies current password before updating to the desired new password.
   * @param {ChangePasswordDto} dto - Payload with current password, new password, and optional session revocation flag.
   * @returns {Promise<{ success: boolean; message?: string }>} Password change result status.
   */
  static async changePassword(
    dto: ChangePasswordDto
  ): Promise<{ success: boolean; message?: string }> {
    return http.post<{ success: boolean; message?: string }>(ENDPOINTS.AUTH.CHANGE_PASSWORD, dto);
  }
}
