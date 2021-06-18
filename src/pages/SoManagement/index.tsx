import React, { FormEvent, useEffect, useState } from "react";
import MyTableExcel from "../../components/ExcelTable";

import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";

import {
  Container,
  InputLine,
  Label,
  Header,
  PlusIcon,
  PlusCircleIcon,
  Section,
  Title,
  ItemsPurchasedContainer,
  TitleProducts,
  Divisor,
  Text,
} from "./styles";
import InputWithLabelAtTheTop from "../../components/InputWithLabelAtTheTop";
import Button from "../../components/Button";
import ButtonWithIcon from "../../components/ButtonWithIcon";

import { FiCoffee } from "react-icons/fi";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import api from "../../services/api";

interface SOProps {
  id: string;
  SONumber: string;
  client: string;
  seller: string;
  responsibleTechnician: string;
  costOfSO: string;
  running: true;
  completed: false;
  closed: false;
}

interface ProductProps {
  id: string;
  name: string;
  value: number;
  quantity: number;
  unitOfMeasure: string;
  costCenter: string;
}

interface MaterialsProps {
  name: string;
  quantity: number;
  value: number;
}

interface Teste {
  inputValue?: string;
  name: string;
}

const SoManagement = () => {
  const [SORunning, setSORunning] = useState<SOProps[]>([]);
  const [SOCompleted, setSOCompleted] = useState<SOProps[]>([]);
  const [SOClosed, setSOClosed] = useState<SOProps[]>([]);

  const [products, setProducts] = useState<ProductProps[]>([
    {
      id: "1",
      name: "x",
      value: 10,
      quantity: 192,
      unitOfMeasure: "x",
      costCenter: "x",
    },
  ]);

  const [client, setClient] = useState<Teste | null>(null);
  const [clients, setClients] = useState<Teste[]>([]);

  const [seller, setSeller] = useState<Teste | null>(null);
  const [sellers, setSellers] = useState<Teste[]>([]);

  const [responsibleTechnician, setResponsibleTechnician] =
    useState<Teste | null>(null);
  const [responsibleTechnicians, setResponsibleTechnicians] = useState<Teste[]>(
    []
  );

  const [
    openServiceOrderRegistrationModal,
    setOpenServiceOrderRegistrationModal,
  ] = useState(false);
  const [openAddMaterialToAnSoModal, setOpenAddMaterialToAnSoModal] =
    useState(false);
  const [
    openReturnAMaterialFromAnOsModal,
    setOpenReturnAMaterialFromAnOsModal,
  ] = useState(false);
  const [openEndAnOsModal, setOpenEndAnOsModal] = useState(false);
  const [openOsDetailsModal, setOpenOsDetailsModal] = useState(false);

  const [SONumber, setSONumber] = useState(0);
  const [product, setProduct] = useState<Teste | null>(null);
  const [quantity, setQuantity] = useState(0);
  const [manpower, setManpower] = useState(0);
  const [displacement, setDisplacement] = useState(0);

  const [materials, setMaterials] = useState<MaterialsProps[]>([]);

  const [materialsInStock, setMaterialsInStock] = useState<Teste[]>([]);

  const [addMaterialAndClose, setAddMaterialAndClose] = useState(false);

  function handleServiceOrderRegistration(e: FormEvent) {
    e.preventDefault();
    const so = {
      SONumber,
      client: client?.name || "",
      seller: seller?.name || "",
      responsibleTechnician: responsibleTechnician?.name || "",
      costOfSO: "2000",
      running: true,
      completed: false,
      closed: false,
      openingDate: new Date(),
      closingDate: new Date(),
      materials,
    };

    api.post("/so", so);

    api.post("/clients", { name: so.client });
    api.post("/sellers", { name: so.seller });
    api.post("/responsibleTechnicians", { name: so.responsibleTechnician });

    setOpenServiceOrderRegistrationModal(false);
    getSO();
    getInputSearchResults();
  }

  async function getSO() {
    try {
      const { data } = await api.get<SOProps[]>("/so");

      setSORunning(data.filter((so: SOProps) => so.running));
      setSOCompleted(data.filter((so: SOProps) => so.completed));
      setSOClosed(data.filter((so: SOProps) => so.closed));
    } catch (error) {
      console.log(error);
    }
  }

  async function closeOS(id: string) {
    try {
      const { data } = await api.patch(`/so/${id}`, {
        running: false,
        completed: true,
        closed: false,
      });
      setSOCompleted([...SOCompleted, data]);
      setSORunning((so) => so.filter((el) => el.id !== id));
    } catch (error) {
      console.log(error);
    }
  }
  async function openOS(id: string) {
    try {
      const { data } = await api.patch(`/so/${id}`, {
        running: true,
        completed: false,
        closed: false,
      });
      setSOCompleted((so) => so.filter((el) => el.id !== id));
      setSORunning([...SORunning, data]);
    } catch (error) {
      console.log();
    }
  }

  function addMaterialToAnOs() {
    if (SONumber !== 0 && client) {
      setOpenAddMaterialToAnSoModal(true);
    } else {
      alert("Preencha todos os dados antes de adicionar um material!");
    }
  }

  async function handleAddMaterialToAnSoModal(e: FormEvent) {
    e.preventDefault();
    try {
      const { data } = await api.get(`/products?name=${product!.name}`);

      if (addMaterialAndClose) {
        setMaterials([
          ...materials,
          { name: product!.name, quantity, value: data[0].value },
        ]);
        setOpenAddMaterialToAnSoModal(false);
      } else {
        setMaterials([
          ...materials,
          { name: product!.name, quantity, value: data[0].value },
        ]);
        setProduct(null);
        setQuantity(0);
        setOpenAddMaterialToAnSoModal(true);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function getInputSearchResults() {
    try {
      const { data } = await api.get<ProductProps[]>("/products");

      let parsedData: Teste[] = [];

      data.forEach((product) => {
        parsedData.push({ name: product.name });
      });
      setMaterialsInStock(parsedData);

      const { data: clients } = await api.get("/clients");
      setClients(clients);

      const { data: sellers } = await api.get("/sellers");
      setSellers(sellers);

      const { data: responsibleTechnicians } = await api.get(
        "/responsibleTechnicians"
      );
      setResponsibleTechnicians(responsibleTechnicians);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    setProduct(null);
    setQuantity(0);
  }, [openAddMaterialToAnSoModal, openReturnAMaterialFromAnOsModal]);

  useEffect(() => {
    getSO();
    getInputSearchResults();
  }, []);

  return (
    <Container>
      {openServiceOrderRegistrationModal && (
        <Modal
          title="Cadastro de Ordem de Serviço"
          handleSubmit={handleServiceOrderRegistration}
          setOpenModal={setOpenServiceOrderRegistrationModal}
          style={{ opacity: openAddMaterialToAnSoModal ? 0 : 1 }}
        >
          <div>
            <Input
              label="Número da OS"
              placeholder="Insira o número da OS"
              type="number"
              value={SONumber === 0 ? "" : SONumber}
              min="0"
              onChange={(e) => {
                setSONumber(Number(e.target.value));
              }}
            />
            <Input
              inputSearch
              data={clients}
              label="Cliente"
              placeholder="Insira o cliente"
              inputSearchValue={client}
              setValue={setClient}
            />
            <Input
              inputSearch
              data={sellers}
              label="Vendedor"
              placeholder="Insira o nome do vendedor"
              inputSearchValue={seller}
              setValue={setSeller}
            />
            <Input
              inputSearch
              data={responsibleTechnicians}
              label="Técnico Responsável"
              placeholder="Insira o nome do técnico responsável"
              inputSearchValue={responsibleTechnician}
              setValue={setResponsibleTechnician}
            />

            <InputLine
              style={{ gridTemplateColumns: "1fr 2.5fr", padding: 0, gap: 60 }}
            >
              <Label>Materiais</Label>
              <div>
                <Label className="label-top">
                  {materials.length !== 0 ? (
                    <MyTableExcel
                      style={{ margin: 0 }}
                      columns={[{ name: "Material" }, { name: "Quantidade" }]}
                    >
                      {materials.map((material: MaterialsProps) => (
                        <TableRow key={material.name}>
                          <TableCell width={150} component="th" scope="row">
                            {material.name}
                          </TableCell>
                          <TableCell align="left">
                            {material.quantity}
                          </TableCell>
                        </TableRow>
                      ))}
                    </MyTableExcel>
                  ) : (
                    "Sem itens alocados a essa OS"
                  )}
                </Label>
                <Button
                  type="button"
                  outline
                  color="#6558F5"
                  onClick={() => {
                    addMaterialToAnOs();
                  }}
                >
                  <PlusCircleIcon /> Adicionar Material á OS
                </Button>
              </div>
            </InputLine>
          </div>
          <>
            <Button
              type="button"
              outline
              color="#6558F5"
              onClick={() => {
                setOpenServiceOrderRegistrationModal(false);
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" color="#1AAE9F">
              Criar OS
            </Button>
          </>
        </Modal>
      )}

      {openAddMaterialToAnSoModal && (
        <Modal
          title="Adicionar Material à uma OS"
          handleSubmit={handleAddMaterialToAnSoModal}
          setOpenModal={setOpenAddMaterialToAnSoModal}
        >
          <div>
            <Input label="Número da OS" disabled={true} value={SONumber} />
            <Input label="Cliente" disabled={true} value={client?.name || ""} />
            <Input
              inputSearch
              noAddOption
              data={materialsInStock}
              label="Produto"
              placeholder="Ex: Mangueira, Parafuso, Suporte, etc..."
              inputSearchValue={product}
              setValue={setProduct}
            />

            <Input
              label="Quantidade"
              placeholder="Informe a quantidade do material"
              type="number"
              value={quantity === 0 ? "" : quantity}
              min="0"
              onChange={(e) => {
                setQuantity(Number(e.target.value));
              }}
            />
          </div>
          <>
            <Button
              type="button"
              outline
              color="#6558F5"
              onClick={() => {
                setOpenAddMaterialToAnSoModal(false);
              }}
            >
              Cancelar
            </Button>
            <div style={{ display: "flex" }}>
              <Button
                outline
                type="submit"
                color="#1AAE9F"
                onClick={() => {
                  setAddMaterialAndClose(false);
                }}
              >
                Salvar e Adicionar Mais itens
              </Button>
              <Button
                style={{ marginLeft: 20 }}
                type="submit"
                color="#1AAE9F"
                onClick={() => {
                  setAddMaterialAndClose(true);
                }}
              >
                Criar OS
              </Button>
            </div>
          </>
        </Modal>
      )}

      {openReturnAMaterialFromAnOsModal && (
        <Modal
          title="Retornar o Material à uma OS"
          handleSubmit={handleServiceOrderRegistration}
          setOpenModal={setOpenReturnAMaterialFromAnOsModal}
        >
          <div>
            <Input label="Número da OS" disabled={true} value="100101" />
            <Input
              label="Cliente"
              disabled={true}
              value="Shoppping Maringá Park"
            />
            <Input
              inputSearch
              noAddOption
              data={materialsInStock}
              label="Produto"
              placeholder="Ex: Mangueira, Parafuso, Suporte, etc..."
              inputSearchValue={product}
              setValue={setProduct}
            />
            <Input
              label="Quantidade"
              placeholder="Informe a quantidade do material"
              type="number"
              value={quantity === 0 ? "" : quantity}
              min="0"
              onChange={(e) => {
                setQuantity(Number(e.target.value));
              }}
            />
          </div>
          <>
            <Button
              type="button"
              outline
              color="#6558F5"
              onClick={() => {
                setOpenReturnAMaterialFromAnOsModal(false);
              }}
            >
              Cancelar
            </Button>
            <div style={{ display: "flex" }}>
              <Button outline type="submit" color="#1AAE9F">
                Salvar e Adicionar Mais itens
              </Button>
              <Button style={{ marginLeft: 20 }} type="submit" color="#1AAE9F">
                Criar OS
              </Button>
            </div>
          </>
        </Modal>
      )}

      {openEndAnOsModal && (
        <Modal
          title="Encerrar uma OS"
          handleSubmit={handleServiceOrderRegistration}
          setOpenModal={setOpenEndAnOsModal}
        >
          <div>
            <Input label="Número da OS" disabled={true} value="100101" />
            <Input
              label="Cliente"
              disabled={true}
              value="Shoppping Maringá Park"
            />
            <Input
              label="Mão de obra"
              placeholder="Informe quantas horas essa obra durou"
              type="number"
              value={manpower === 0 ? "" : manpower}
              onChange={(e) => {
                setManpower(Number(e.target.value));
              }}
            />
            <Input
              label="Deslocamento"
              placeholder="Informe a quantidade de visitas"
              type="number"
              value={displacement === 0 ? "" : displacement}
              onChange={(e) => {
                setDisplacement(Number(e.target.value));
              }}
            />
          </div>
          <>
            <Button
              type="button"
              outline
              color="#6558F5"
              onClick={() => {
                setOpenEndAnOsModal(false);
              }}
            >
              Cancelar
            </Button>
            <div style={{ display: "flex" }}>
              <Button outline type="submit" color="#1AAE9F">
                Encerrar e ver Detalhes
              </Button>
              <Button style={{ marginLeft: 20 }} type="submit" color="#1AAE9F">
                Encerrar OS
              </Button>
            </div>
          </>
        </Modal>
      )}

      {openOsDetailsModal && (
        <Modal
          title="Detalhes da OS"
          handleSubmit={handleServiceOrderRegistration}
          setOpenModal={setOpenOsDetailsModal}
        >
          <div>
            <InputLine>
              <InputWithLabelAtTheTop
                label="Data da abertura:"
                disabled={true}
                value="13/08/1997"
              />
              <InputWithLabelAtTheTop
                label="Data do fechamento:"
                disabled={true}
                value="19/04/2021"
              />
            </InputLine>
            <InputLine>
              <InputWithLabelAtTheTop
                label="Número da OS"
                disabled={true}
                value="100101"
              />
              <InputWithLabelAtTheTop
                label="Cliente"
                disabled={true}
                value="Shoppping Maringá Park"
              />
            </InputLine>
            <InputLine>
              <InputWithLabelAtTheTop
                label="Técnico"
                disabled={true}
                value="Heitor Franco"
              />
              <InputWithLabelAtTheTop
                label="Vendedor"
                disabled={true}
                value="Regina"
              />
            </InputLine>
            <InputLine>
              <InputWithLabelAtTheTop
                label="Mão de Obra"
                disabled={true}
                value="10 Horas"
              />
              <InputWithLabelAtTheTop
                label="Deslocamento"
                disabled={true}
                value="3 Visitas"
              />
            </InputLine>
            <ItemsPurchasedContainer>
              <Divisor />
              <TitleProducts>Materiais Utilizados</TitleProducts>
              {products.length ? (
                <MyTableExcel
                  columns={[
                    { name: "Nome do Produto" },
                    { name: "Valor Unitário" },
                    { name: "Quantidade" },
                    { name: "Valor Total" },
                  ]}
                >
                  {products.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell component="th" scope="row">
                        {item.name}
                      </TableCell>
                      <TableCell align="left">R$ {item.value}</TableCell>
                      <TableCell align="left">{item.quantity}</TableCell>
                      <TableCell align="left">
                        R$ {item.quantity * item.value}
                      </TableCell>
                    </TableRow>
                  ))}
                </MyTableExcel>
              ) : (
                <Text>Nenhum material foi alocado a essa OS</Text>
              )}
            </ItemsPurchasedContainer>
          </div>

          <>
            <Button
              type="button"
              outline
              color="#6558F5"
              onClick={() => {
                setOpenOsDetailsModal(false);
              }}
            >
              Cancelar
            </Button>
            <div style={{ display: "flex" }}>
              <Button outline type="submit" color="#1AAE9F">
                Encerrar e ver Detalhes
              </Button>
              <Button style={{ marginLeft: 20 }} type="submit" color="#1AAE9F">
                Imprimir OS
              </Button>
            </div>
          </>
        </Modal>
      )}
      <Header>
        <InputWithLabelAtTheTop
          label="Pesquisar"
          placeholder="Cliente, número ou vendedor"
        />
        <Button
          color="#1AAE9F"
          onClick={() => {
            setOpenServiceOrderRegistrationModal(true);
          }}
        >
          <PlusIcon /> Nova OS
        </Button>
      </Header>
      <Section>
        <Title>Em execução:</Title>
        <MyTableExcel
          style={{ margin: 0 }}
          columns={[
            { name: "Número da OS" },
            { name: "Cliente" },
            { name: "Vendedor" },
            { name: "Técnico" },
            { name: "Custo da OS" },
            { name: "Ações", align: "right" },
          ]}
        >
          {SORunning.length !== 0 &&
            SORunning.map((so: SOProps) => (
              <TableRow key={so.id}>
                <TableCell width={150} component="th" scope="row">
                  {so.SONumber}
                </TableCell>
                <TableCell align="left">{so.client}</TableCell>
                <TableCell align="left">{so.seller}</TableCell>
                <TableCell align="left">{so.responsibleTechnician}</TableCell>
                <TableCell align="left">R$ {so.costOfSO}</TableCell>
                <TableCell align="right" width={160}>
                  <ButtonWithIcon
                    Icon={FiCoffee}
                    onClick={() => {
                      closeOS(so.id);
                    }}
                  />
                  <ButtonWithIcon
                    Icon={FiCoffee}
                    onClick={() => {
                      setOpenAddMaterialToAnSoModal(true);
                    }}
                  />
                  <ButtonWithIcon
                    Icon={FiCoffee}
                    onClick={() => {
                      setOpenReturnAMaterialFromAnOsModal(true);
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          {SORunning.length < 6 &&
            Array(6 - SORunning.length)
              .fill("")
              .map((so) => (
                <TableRow>
                  <TableCell
                    style={{ opacity: 0 }}
                    width={150}
                    component="th"
                    scope="row"
                  >
                    None
                  </TableCell>
                  <TableCell style={{ opacity: 0 }} align="left">
                    None
                  </TableCell>
                  <TableCell style={{ opacity: 0 }} align="left">
                    None
                  </TableCell>
                  <TableCell style={{ opacity: 0 }} align="left">
                    None
                  </TableCell>
                  <TableCell style={{ opacity: 0 }} align="left">
                    None
                  </TableCell>
                  <TableCell style={{ opacity: 0 }} align="right" width={160}>
                    <ButtonWithIcon
                      Icon={FiCoffee}
                      onClick={() => {
                        setOpenAddMaterialToAnSoModal(true);
                      }}
                    />
                    <ButtonWithIcon
                      Icon={FiCoffee}
                      onClick={() => {
                        setOpenReturnAMaterialFromAnOsModal(true);
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
        </MyTableExcel>
      </Section>
      <Section>
        <Title>Obras concluidas:</Title>
        <MyTableExcel
          style={{ margin: 0 }}
          columns={[
            { name: "Número da OS" },
            { name: "Cliente" },
            { name: "Vendedor" },
            { name: "Técnico" },
            { name: "Custo da OS" },
            { name: "Ações", align: "right" },
          ]}
        >
          {SOCompleted.length !== 0 &&
            SOCompleted.map((so: SOProps) => (
              <TableRow key={so.id}>
                <TableCell width={150} component="th" scope="row">
                  {so.SONumber}
                </TableCell>
                <TableCell align="left">{so.client}</TableCell>
                <TableCell align="left">{so.seller}</TableCell>
                <TableCell align="left">{so.responsibleTechnician}</TableCell>
                <TableCell align="left">R$ {so.costOfSO}</TableCell>
                <TableCell align="right" width={160}>
                  <ButtonWithIcon
                    Icon={FiCoffee}
                    onClick={() => {
                      openOS(so.id);
                    }}
                  />
                  <ButtonWithIcon
                    Icon={FiCoffee}
                    onClick={() => {
                      setOpenEndAnOsModal(true);
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          {SOCompleted.length < 6 &&
            Array(6 - SOCompleted.length)
              .fill("")
              .map((so) => (
                <TableRow>
                  <TableCell
                    style={{ opacity: 0 }}
                    width={150}
                    component="th"
                    scope="row"
                  >
                    None
                  </TableCell>
                  <TableCell style={{ opacity: 0 }} align="left">
                    None
                  </TableCell>
                  <TableCell style={{ opacity: 0 }} align="left">
                    None
                  </TableCell>
                  <TableCell style={{ opacity: 0 }} align="left">
                    None
                  </TableCell>
                  <TableCell style={{ opacity: 0 }} align="left">
                    None
                  </TableCell>
                  <TableCell
                    style={{
                      opacity: 0,
                    }}
                    align="right"
                    width={160}
                  >
                    <ButtonWithIcon
                      Icon={FiCoffee}
                      onClick={() => {
                        setOpenAddMaterialToAnSoModal(true);
                      }}
                    />
                    <ButtonWithIcon
                      Icon={FiCoffee}
                      onClick={() => {
                        setOpenReturnAMaterialFromAnOsModal(true);
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
        </MyTableExcel>
      </Section>
      <Section>
        <Title>Os Encerradas:</Title>
        <MyTableExcel
          style={{ margin: 0 }}
          columns={[
            { name: "Número da OS" },
            { name: "Cliente" },
            { name: "Vendedor" },
            { name: "Técnico" },
            { name: "Custo da OS" },
            { name: "Ações", align: "right" },
          ]}
        >
          {SOClosed.length !== 0 &&
            SOClosed.map((so: SOProps) => (
              <TableRow key={so.id}>
                <TableCell width={150} component="th" scope="row">
                  {so.SONumber}
                </TableCell>
                <TableCell align="left">{so.client}</TableCell>
                <TableCell align="left">{so.seller}</TableCell>
                <TableCell align="left">{so.responsibleTechnician}</TableCell>
                <TableCell align="left">R$ {so.costOfSO}</TableCell>
                <TableCell align="right" width={160}>
                  <ButtonWithIcon
                    Icon={FiCoffee}
                    onClick={() => {
                      setOpenOsDetailsModal(true);
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          {SOClosed.length < 6 &&
            Array(6 - SOClosed.length)
              .fill("")
              .map((so) => (
                <TableRow>
                  <TableCell
                    style={{ opacity: 0 }}
                    width={150}
                    component="th"
                    scope="row"
                  >
                    None
                  </TableCell>
                  <TableCell style={{ opacity: 0 }} align="left">
                    None
                  </TableCell>
                  <TableCell style={{ opacity: 0 }} align="left">
                    None
                  </TableCell>
                  <TableCell style={{ opacity: 0 }} align="left">
                    None
                  </TableCell>
                  <TableCell style={{ opacity: 0 }} align="left">
                    None
                  </TableCell>
                  <TableCell style={{ opacity: 0 }} align="right" width={160}>
                    <ButtonWithIcon
                      Icon={FiCoffee}
                      onClick={() => {
                        setOpenAddMaterialToAnSoModal(true);
                      }}
                    />
                    <ButtonWithIcon
                      Icon={FiCoffee}
                      onClick={() => {
                        setOpenReturnAMaterialFromAnOsModal(true);
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
        </MyTableExcel>
      </Section>
    </Container>
  );
};

export default SoManagement;
