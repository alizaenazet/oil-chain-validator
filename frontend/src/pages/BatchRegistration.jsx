import { useState } from "react";
import Navbar from "../components/Navbar";

function BatchRegistration() {
  const [variantId, setVariantId] =
    useState("");

  const [serials, setSerials] =
    useState("");

  const [registeredBatches,
    setRegisteredBatches] =
    useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const serialList =
      serials
        .split("\n")
        .filter(
          (item) =>
            item.trim() !== ""
        );

    const newBatch = {
      id: Date.now(),
      variantId,
      totalProducts:
        serialList.length,
      serials: serialList,
    };

    setRegisteredBatches([
      ...registeredBatches,
      newBatch,
    ]);

    setVariantId("");
    setSerials("");
  };

  return (
    <div>
      <Navbar />

      <h1>Batch Registration</h1>

      <form onSubmit={handleSubmit}>
        <label>
          Variant ID
        </label>

        <br />

        <input
          type="number"
          value={variantId}
          onChange={(e) =>
            setVariantId(
              e.target.value
            )
          }
        />

        <br />
        <br />

        <label>
          Serial Numbers
        </label>

        <br />

        <textarea
          rows="10"
          cols="60"
          placeholder={`SN001
SN002
SN003`}
          value={serials}
          onChange={(e) =>
            setSerials(
              e.target.value
            )
          }
        />

        <br />
        <br />

        <button type="submit">
          Register Batch
        </button>
      </form>

      <hr />

      <h2>Registered Batches</h2>

      {registeredBatches.map(
        (batch) => (
          <div
            key={batch.id}
            style={{
              border:
                "1px solid #ccc",
              padding: "10px",
              marginBottom: "10px",
            }}
          >
            <p>
              Batch ID:
              {batch.id}
            </p>

            <p>
              Variant ID:
              {batch.variantId}
            </p>

            <p>
              Total Products:
              {
                batch.totalProducts
              }
            </p>
          </div>
        )
      )}
    </div>
  );
}

export default BatchRegistration;