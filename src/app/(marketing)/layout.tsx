export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {/* Navbar will go here */}
      <main>{children}</main>
      {/* Footer will go here */}
    </div>
  );
}


