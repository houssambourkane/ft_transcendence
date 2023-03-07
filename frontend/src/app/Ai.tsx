import {
  Button,
  ColorInput,
  Group,
  Modal,
  SegmentedControl,
} from "@mantine/core";
import { IconRocket } from "@tabler/icons-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Table from "../components/Table/Table";

const swatches = [
  "#FFFFFF",
  "#868e96",
  "#fa5252",
  "#e64980",
  "#be4bdb",
  "#7950f2",
  "#4c6ef5",
  "#228be6",
  "#15aabf",
  "#12b886",
  "#40c057",
  "#82c91e",
  "#fab005",
  "#fd7e14",
];

export default function Ai() {
  const [paddle1, setPaddle1] = useState("#FFFFFF");
  const [paddle2, setPaddle2] = useState("#FFFFFF");
  const [ball, setBall] = useState("#FFFFFF");
  const [level, setLevel] = useState("1");
  const [started, setStarted] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <Modal
        opened={!started}
        centered
        overlayBlur={3}
        onClose={() => navigate("/")}
        title="Choose options"
      >
        <SegmentedControl
          value={level}
          onChange={setLevel}
          data={[
            { label: "Easy", value: "1" },
            { label: "Medium", value: "2" },
            { label: "Hard", value: "3" },
            { label: "Extreme", value: "5" },
          ]}
        />
        <ColorInput
          mt="md"
          value={ball}
          onChange={setBall}
          format="hex"
          label="Ball color"
          swatches={swatches}
        />
        <ColorInput
          value={paddle1}
          onChange={setPaddle1}
          mt="md"
          format="hex"
          label="Paddle color"
          swatches={swatches}
        />
        <ColorInput
          value={paddle2}
          onChange={setPaddle2}
          mt="md"
          format="hex"
          label="AI paddle color"
          swatches={swatches}
        />
        <Button
          fullWidth
          mt="lg"
          size="md"
          onClick={() => setStarted(true)}
          leftIcon={<IconRocket size={20} />}
          disabled={!paddle1 || !paddle2 || !ball}
        >
          Start Playing
        </Button>
      </Modal>
      {started && (
        <>
          <div className="flex justify-center items-center mb-4">
            <h1 className="m-0">Playing with AI</h1>
          </div>
          <Table
            role="player1"
            personColor={paddle1}
            aiColor={paddle2}
            ballColor={ball}
            level={parseInt(level)}
          />
        </>
      )}
    </>
  );
}
