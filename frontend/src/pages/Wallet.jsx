import { useEffect, useState } from "react";
import Modal from "../components/Modal";
import { walletApi } from "../services/api";
import { getErrorMessage, notifyError, notifySuccess } from "../services/notify";

const Wallet = () => {
  const [wallet, setWallet] = useState({
    balance: 0,
    transactions: [],
    deposits: [],
    withdrawals: [],
    upiId: "",
    depositQrImageUrl: ""
  });
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [depositForm, setDepositForm] = useState({ amount: "", upiTransactionId: "" });
  const [withdrawForm, setWithdrawForm] = useState({ amount: "", upiId: "" });

  const loadWallet = async () => {
    try {
      const response = await walletApi.getOverview();
      setWallet(response.data);
    } catch (requestError) {
      notifyError(getErrorMessage(requestError, "Failed to load wallet."));
    }
  };

  useEffect(() => {
    loadWallet();
  }, []);

  const submitDeposit = async (event) => {
    event.preventDefault();
    try {
      await walletApi.deposit({
        amount: Number(depositForm.amount),
        upiTransactionId: depositForm.upiTransactionId
      });
      setDepositOpen(false);
      setDepositForm({ amount: "", upiTransactionId: "" });
      notifySuccess("Deposit request submitted successfully.");
      await loadWallet();
    } catch (requestError) {
      notifyError(getErrorMessage(requestError, "Deposit request failed."));
    }
  };

  const submitWithdrawal = async (event) => {
    event.preventDefault();
    try {
      await walletApi.withdraw({
        amount: Number(withdrawForm.amount),
        upiId: withdrawForm.upiId
      });
      setWithdrawOpen(false);
      setWithdrawForm({ amount: "", upiId: "" });
      notifySuccess("Withdrawal request submitted successfully.");
      await loadWallet();
    } catch (requestError) {
      notifyError(getErrorMessage(requestError, "Withdrawal request failed."));
    }
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 sm:py-8 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[32px] bg-ink p-6 text-white shadow-card sm:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-orange-300">Wallet</p>
          <h1 className="mt-3 break-words font-heading text-3xl font-bold sm:text-4xl">Rs. {wallet.balance}</h1>
          <p className="mt-3 text-sm text-slate-300">Available balance</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-ink"
              onClick={() => setDepositOpen(true)}
            >
              Deposit
            </button>
            <button
              type="button"
              className="rounded-full border border-white/30 px-5 py-3 text-sm font-semibold text-white"
              onClick={() => setWithdrawOpen(true)}
            >
              Withdraw
            </button>
          </div>
        </div>

        <div className="rounded-[32px] bg-white p-5 shadow-card sm:p-8">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-heading text-xl font-semibold text-ink sm:text-2xl">Recent Transactions</h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase text-slate-500">
              {wallet.transactions.length} items
            </span>
          </div>
          <div className="space-y-3">
            {wallet.transactions.map((item) => (
              <div key={item._id} className="flex flex-col gap-2 rounded-2xl bg-mist p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold capitalize text-ink">{item.category.replace("_", " ")}</p>
                  <p className="text-sm text-slate-500">{item.status}</p>
                </div>
                <p
                  className={`break-words font-bold ${item.type === "credit" ? "text-green-600" : "text-red-500"}`}
                >
                  {item.type === "credit" ? "+" : "-"}Rs. {item.amount}
                </p>
              </div>
            ))}
            {!wallet.transactions.length && (
              <p className="rounded-2xl bg-mist p-4 text-sm text-slate-500">No transactions yet.</p>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={depositOpen} title="Request Deposit" onClose={() => setDepositOpen(false)}>
        <form className="space-y-4" onSubmit={submitDeposit}>
          {wallet.depositQrImageUrl && (
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-3 text-sm font-semibold text-slate-500">Scan this QR and complete payment first</p>
              <img
                src={wallet.depositQrImageUrl}
                alt="Deposit QR"
                className="mx-auto h-52 w-52 rounded-2xl object-cover"
              />
            </div>
          )}
          <input
            className="input-field"
            placeholder="Amount"
            type="number"
            value={depositForm.amount}
            onChange={(event) =>
              setDepositForm((current) => ({ ...current, amount: event.target.value }))
            }
            required
          />
          <input
            className="input-field"
            placeholder="UPI Transaction ID"
            value={depositForm.upiTransactionId}
            onChange={(event) =>
              setDepositForm((current) => ({
                ...current,
                upiTransactionId: event.target.value
              }))
            }
            required
          />
          <button type="submit" className="w-full rounded-full bg-primary px-4 py-3 font-semibold text-white">
            Submit Deposit
          </button>
        </form>
      </Modal>

      <Modal isOpen={withdrawOpen} title="Request Withdrawal" onClose={() => setWithdrawOpen(false)}>
        <form className="space-y-4" onSubmit={submitWithdrawal}>
          <input
            className="input-field"
            placeholder="Amount"
            type="number"
            value={withdrawForm.amount}
            onChange={(event) =>
              setWithdrawForm((current) => ({ ...current, amount: event.target.value }))
            }
            required
          />
          <input
            className="input-field"
            placeholder="UPI ID"
            value={withdrawForm.upiId || wallet.upiId}
            onChange={(event) =>
              setWithdrawForm((current) => ({ ...current, upiId: event.target.value }))
            }
            required
          />
          <button type="submit" className="w-full rounded-full bg-ink px-4 py-3 font-semibold text-white">
            Submit Withdrawal
          </button>
        </form>
      </Modal>
    </section>
  );
};

export default Wallet;
