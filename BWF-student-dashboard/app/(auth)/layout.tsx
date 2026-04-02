export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="auth-wrapper">
      {/* You can add a shared logo or background here later */}
      {children}
    </section>
  );
}
