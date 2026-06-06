import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

function BatchRegistration() {
  const [variantId, setVariantId] =
    useState("");

  const [serials, setSerials] =
    useState("");

  const [registeredBatches,
    setRegisteredBatches] =
    useState(() => {
      const savedBatches =
        localStorage.getItem(
          "registeredBatches"
        );

      return savedBatches
        ? JSON.parse(savedBatches)
        : [];
    });

  useEffect(() => {
    localStorage.setItem(
      "registeredBatches",
      JSON.stringify(
        registeredBatches
      )
    );
  }, [registeredBatches]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!variantId || !serials) return;

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

      {registeredBatches.length === 0 ? (
        <p>No batches registered yet.</p>
      ) : (
        registeredBatches.map(
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
                <strong>
                  Batch ID:
                </strong>{" "}
                {batch.id}
              </p>

              <p>
                <strong>
                  Variant ID:
                </strong>{" "}
                {batch.variantId}
              </p>

              <p>
                <strong>
                  Total Products:
                </strong>{" "}
                {
                  batch.totalProducts
                }
              </p>

              <details>
                <summary>
                  View Serial Numbers
                </summary>

                <ul>
                  {batch.serials.map(
                    (
                      serial,
                      index
                    ) => (
                      <li
                        key={index}
                      >
                        {serial}
                      </li>
                    )
                  )}
                </ul>
              </details>
            </div>
          )
        )
      )}
    </div>
  );
}

export default BatchRegistration;