export async function signIn(email: string, password: string) {
  const response = await fetch("/api/auth/signin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

export async function signOut() {
  const response = await fetch("/api/auth/signout", {
    method: "POST",
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

export async function getSession() {
  const response = await fetch("/api/auth/session");
  if (!response.ok) {
    return null;
  }
  return response.json();
}
