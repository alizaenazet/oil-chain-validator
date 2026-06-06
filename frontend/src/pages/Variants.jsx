import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

function Variants() {
  const [brand, setBrand] = useState("");
  const [oilType, setOilType] = useState("");

  const [variants, setVariants] = useState(() => {
    const savedVariants =
      localStorage.getItem("variants");

    return savedVariants
      ? JSON.parse(savedVariants)
      : [
          {
            id: 1,
            brand: "Shell",
            oilType: "5W-30",
          },
          {
            id: 2,
            brand: "Pertamina",
            oilType: "10W-40",
          },
        ];
  });

  useEffect(() => {
    localStorage.setItem(
      "variants",
      JSON.stringify(variants)
    );
  }, [variants]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!brand || !oilType) return;

    const newVariant = {
      id: Date.now(),
      brand,
      oilType,
    };

    setVariants([
      ...variants,
      newVariant,
    ]);

    setBrand("");
    setOilType("");
  };

  const handleDelete = (id) => {
    setVariants(
      variants.filter(
        (variant) => variant.id !== id
      )
    );
  };

  return (
    <div>
      <Navbar />

      <h1>Variants</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Brand"
          value={brand}
          onChange={(e) =>
            setBrand(e.target.value)
          }
        />

        <br />
        <br />

        <input
          type="text"
          placeholder="Oil Type"
          value={oilType}
          onChange={(e) =>
            setOilType(e.target.value)
          }
        />

        <br />
        <br />

        <button type="submit">
          Add Variant
        </button>
      </form>

      <hr />

      <h2>Variant List</h2>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>ID</th>
            <th>Brand</th>
            <th>Oil Type</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {variants.map((variant) => (
            <tr key={variant.id}>
              <td>{variant.id}</td>
              <td>{variant.brand}</td>
              <td>{variant.oilType}</td>
              <td>
                <button
                  onClick={() =>
                    handleDelete(
                      variant.id
                    )
                  }
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Variants;