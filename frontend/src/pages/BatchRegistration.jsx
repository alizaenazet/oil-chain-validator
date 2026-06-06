import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

function BatchRegistration() {
  const [variantId, setVariantId] = useState("");
  const [serials, setSerials] = useState("");

  const [registeredBatches, setRegisteredBatches] =
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

    const serialList = serials
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

      <div style={{ padding: "20px" }}>
        <h1>
          Batch Registration
        </h1>

        <div
          style={{
            border: "1px solid #ddd",
            padding: "20px",
            borderRadius: "8px",
            marginTop: "20px",
          }}
        >
          <form
            onSubmit={
              handleSubmit
            }
          >
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
              style={{
                width: "300px",
                padding: "8px",
              }}
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
              style={{
                padding: "8px",
              }}
            />

            <br />
            <br />

            <button
              type="submit"
            >
              Register Batch
            </button>
          </form>
        </div>

        <h2
          style={{
            marginTop: "30px",
          }}
        >
          Registered Batches
        </h2>

        {registeredBatches.length ===
        0 ? (
          <p>
            No batches
            registered yet.
          </p>
        ) : (
          registeredBatches.map(
            (batch) => (
              <div
                key={batch.id}
                style={{
                  border:
                    "1px solid #ddd",
                  borderRadius:
                    "8px",
                  padding:
                    "15px",
                  marginBottom:
                    "15px",
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
                  {
                    batch.variantId
                  }
                </p>

                <p>
                  <strong>
                    Total
                    Products:
                  </strong>{" "}
                  {
                    batch.totalProducts
                  }
                </p>

                <details>
                  <summary>
                    View
                    Serials
                  </summary>

                  <ul>
                    {batch.serials.map(
                      (
                        serial,
                        index
                      ) => (
                        <li
                          key={
                            index
                          }
                        >
                          {
                            serial
                          }
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
    </div>
  );
}

export default BatchRegistration;