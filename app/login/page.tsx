import { signIn, signUp, signInWithGithub, signInWithGoogle } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <main className="container">
      <div className="card">
        <h1>Welcome</h1>
        <p className="muted">Sign in or create an account to manage your todos.</p>

        {error && <div className="alert error" role="alert">{error}</div>}
        {message && <div className="alert ok" role="status">{message}</div>}

        <form>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required autoComplete="email" />
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" required minLength={6} autoComplete="current-password" />
          <div className="row">
            <button className="primary" formAction={signIn}>Sign in</button>
            <button formAction={signUp}>Sign up</button>
          </div>
        </form>

        <div className="divider">or continue with</div>

        <div className="row" style={{ marginTop: 0 }}>
          <form action={signInWithGithub}><button className="full">GitHub</button></form>
          <form action={signInWithGoogle}><button className="full">Google</button></form>
        </div>
      </div>
    </main>
  );
}
