function getEnvironmentVariable(name: string, defaultValue?: string): string {
  const value = process.env[name] ?? defaultValue;

  if (value === undefined) {
    throw new Error(`Environment variable ${name} is required`);
  }

  return value;
}

const CONFIG = {
  jwtSecret: getEnvironmentVariable("JWT_SECRET"),
  jwtExpiresIn: getEnvironmentVariable("JWT_EXPIRES_IN", "15m"),
  jwtRefreshSecret: getEnvironmentVariable("JWT_REFRESH_SECRET"),
  jwtRefreshExpiresIn: getEnvironmentVariable("JWT_REFRESH_EXPIRES_IN", "7d"),
  smtpHost: getEnvironmentVariable("SMTP_HOST", ""),
  smtpPort: Number.parseInt(getEnvironmentVariable("SMTP_PORT", "587"), 10),
  smtpAuthUser: getEnvironmentVariable("SMTP_AUTH_USER", ""),
  smtpAuthPass: getEnvironmentVariable("SMTP_AUTH_PASS", ""),
  senderEmail: getEnvironmentVariable("SENDER_EMAIL", "noreply@library.com"),
};

export default CONFIG;
