import { useState } from "react";

function Variants() {
  const [brand, setBrand] = useState("");
  const [oilType, setOilType] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log({
      brand,
      oilType,
    });
  };

  return (
    <div>
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
    </div>
  );
}

export default Variants;