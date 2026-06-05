function Settings() {
  return (
    <div>
      <h1>Settings</h1>

      <h3>Transfer Ownership</h3>

      <input
        type="text"
        placeholder="Wallet Address"
      />

      <br />
      <br />

      <button>
        Transfer Ownership
      </button>

      <hr />

      <h3>Emergency Revoke</h3>

      <textarea
        rows="5"
        cols="50"
        placeholder="Serial Numbers"
      />

      <br />
      <br />

      <button>
        Revoke Products
      </button>
    </div>
  );
}

export default Settings;