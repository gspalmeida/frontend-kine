import React, { useEffect, useState } from "react";
import api from "../../services/api";
import Button from "../Button";

import {
  Container,
  ProductsTable,
  Product,
  Number,
  Name,
  GraphContainer,
  GraphContent,
  ButtonContainer,
} from "./styles";

interface Teste {
  inputValue?: string;
  name: string;
}

interface ProductProps {
  id: string;
  name: string;
  value: number;
  quantity: number;
  unitOfMeasure: string;
  costCenter: string;
  stockLimit: number;
}

interface CurrentStockContentProps {
  changeValue: (value: number) => void;
  setPreData: React.Dispatch<React.SetStateAction<ProductProps | undefined>>;
}

const CurrentStockContent: React.FC<CurrentStockContentProps> = ({
  changeValue,
  setPreData,
}) => {
  const [products, setProducts] = useState<ProductProps[]>();

  async function getProducts() {
    try {
      const { data } = await api.get("/products");

      setProducts(data);
    } catch (error) {
      console.log(error);
    }
  }

  function getPercent(value: number, max: number) {
    return (value / max) * 100;
  }

  useEffect(() => {
    getProducts();
  }, []);

  return (
    <Container>
      <ProductsTable>
        {products &&
          products.map((product, index) => (
            <Product>
              <Number>{(index + 1).toString().padStart(3, "0")}</Number>
              <Name>{product.name}</Name>
              <GraphContainer>
                <GraphContent
                  percent={getPercent(product.quantity, product.stockLimit)}
                />
              </GraphContainer>
              <ButtonContainer>
                <Button
                  onClick={() => {
                    setPreData(product);
                    changeValue(1);
                  }}
                  disable={
                    getPercent(product.quantity, product.stockLimit) >= 85
                  }
                  color={"#6558f5"}
                >
                  Comprar
                </Button>
              </ButtonContainer>
            </Product>
          ))}
      </ProductsTable>
    </Container>
  );
};
export default CurrentStockContent;
