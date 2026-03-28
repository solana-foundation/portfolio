import { EmptyState } from "@/components/empty-state";

export default function Home() {
  return (
    <EmptyState
      title="Welcome to Solana Portfolio"
      description="Connect your wallet to view your portfolio holdings, token balances, and more."
      actionLabel="Connect Wallet"
    />
  );
}
