import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold">
          Solana Portfolio
        </Link>
        <button
          className="px-4 py-2 rounded-lg bg-zinc-900 text-white text-sm font-medium dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition-opacity"
          disabled
          aria-label="Connect wallet (coming soon)"
        >
          Connect Wallet
        </button>
      </div>
    </header>
  );
}
