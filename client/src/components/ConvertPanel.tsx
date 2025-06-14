import {
  Box,
  Button,
  Flex,
  Text,
  TextField,
  Card,
  Tabs,
} from "@radix-ui/themes";
import { useContext, useState, useEffect } from "react";
import { FeaturePanel } from "./FeaturePanel";
import { SelectedWalletAccountContext } from "../context/SelectedWalletAccountContext";
import { tokenIcons } from "../config";

type TokenRates = {
  [key: string]: number;
};

type Mode = "btc" | "lusd";

const modeRatesMap: Record<Mode, TokenRates> = {
  btc: {
    "BTC-LBTC": 1,
    "LBTC-BTC": 1,
  },
  lusd: {
    "LUSD-sLUSD": 1,
    "sLUSD-LUSD": 1,
  },
};

export function ConvertPanel({ mode }: { mode: Mode }) {
  const [selectedWalletAccount] = useContext(SelectedWalletAccountContext);
  const [activeTab, setActiveTab] = useState<"stake" | "unstake">("stake");

  const rates = modeRatesMap[mode];

  const [fromToken, setFromToken] = useState("");
  const [toToken, setToToken] = useState("");
  const [amount, setAmount] = useState("");
  const [isSwapping, setIsSwapping] = useState(false);

  useEffect(() => {
    if (mode === "btc") {
      if (activeTab === "stake") {
        setFromToken("BTC");
        setToToken("LBTC");
      } else {
        setFromToken("LBTC");
        setToToken("BTC");
      }
    } else if (mode === "lusd") {
      if (activeTab === "stake") {
        setFromToken("LUSD");
        setToToken("sLUSD");
      } else {
        setFromToken("sLUSD");
        setToToken("LUSD");
      }
    }
  }, [activeTab, mode]);

  const getRate = () => {
    const key = `${fromToken}-${toToken}`;
    return rates[key] || 0;
  };

  const getEstimatedAmount = () => {
    if (!amount) return "0";
    const rate = getRate();
    return (parseFloat(amount) * rate).toFixed(6);
  };

  const handleSwap = async () => {
    if (!selectedWalletAccount) {
      alert("Please connect your wallet first");
      return;
    }

    setIsSwapping(true);
    try {
      console.log(
        `Swapping ${amount} ${fromToken} for approximately ${getEstimatedAmount()} ${toToken}`,
      );

      await new Promise((resolve) => setTimeout(resolve, 1000));

      setAmount("");
      alert(
        `Successfully swapped ${amount} ${fromToken} to ${getEstimatedAmount()} ${toToken}`,
      );
    } catch (error: unknown) {
      console.error("Swap failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      alert(`Swap failed: ${errorMessage}`);
    } finally {
      setIsSwapping(false);
    }
  };

  const operationString = activeTab === "stake" ? "Stake" : "Unstake";

  return (
    <FeaturePanel>
      <Card
        style={{
          maxWidth: "450px",
          width: "100%",
          background: "rgba(1, 24, 41, 0.8)",
          border: "1px solid rgba(77, 162, 255, 0.3)",
          borderRadius: "20px",
          padding: "32px",
          boxShadow:
            "0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-5px)";
          e.currentTarget.style.boxShadow =
            "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -6px rgba(0, 0, 0, 0.2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "none";
          e.currentTarget.style.boxShadow =
            "0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)";
        }}
      >
        <Flex direction="column" gap="4">
          <Tabs.Root
            defaultValue="stake"
            onValueChange={(value) =>
              setActiveTab(value as "stake" | "unstake")
            }
          >
            <Tabs.List>
              <Tabs.Trigger
                value="stake"
                style={{ width: "50%", fontSize: "16px", padding: "12px" }}
              >
                Stake
              </Tabs.Trigger>
              <Tabs.Trigger
                value="unstake"
                style={{ width: "50%", fontSize: "16px", padding: "12px" }}
              >
                Unstake
              </Tabs.Trigger>
            </Tabs.List>
          </Tabs.Root>

          <Box>
            <Text
              as="label"
              size="3"
              weight="bold"
              style={{ color: "#4DA2FF" }}
            >
              From
            </Text>
            <Flex gap="2" style={{ marginTop: "6px" }}>
              <Box
                style={{
                  width: "160px",
                  height: "45px",
                  border: "1px solid var(--gray-7)",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  padding: "0 12px",
                  backgroundColor: "var(--gray-3)",
                }}
              >
                <Flex align="center" gap="2">
                  {tokenIcons[fromToken]?.endsWith(".svg") ? (
                    <img
                      src={tokenIcons[fromToken]}
                      alt={fromToken}
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                      }}
                    />
                  ) : (
                    <Text
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                        backgroundColor: "var(--indigo-9)",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "16px",
                        fontWeight: "bold",
                      }}
                    >
                      {tokenIcons[fromToken] || "?"}
                    </Text>
                  )}
                  <Text weight="medium" size="3">
                    {fromToken}
                  </Text>
                </Flex>
              </Box>
              <TextField.Root
                style={{ width: "100%", fontSize: "16px", height: "45px" }}
                placeholder="0.0"
                type="number"
                value={amount}
                onChange={(e: React.SyntheticEvent<HTMLInputElement>) =>
                  setAmount(e.currentTarget.value)
                }
                size="3"
              />
            </Flex>
          </Box>

          <Box style={{ marginTop: "8px" }}>
            <Text
              as="label"
              size="3"
              weight="bold"
              style={{ color: "#4DA2FF" }}
            >
              To
            </Text>
            <Flex gap="2" style={{ marginTop: "6px" }}>
              <Box
                style={{
                  width: "160px",
                  height: "45px",
                  border: "1px solid var(--gray-7)",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  padding: "0 12px",
                  backgroundColor: "var(--gray-3)",
                }}
              >
                <Flex align="center" gap="2">
                  {tokenIcons[toToken]?.endsWith(".svg") ? (
                    <img
                      src={tokenIcons[toToken]}
                      alt={toToken}
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                      }}
                    />
                  ) : (
                    <Text
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                        backgroundColor: "var(--indigo-9)",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "16px",
                        fontWeight: "bold",
                      }}
                    >
                      {tokenIcons[toToken] || "?"}
                    </Text>
                  )}
                  <Text weight="medium" size="3">
                    {toToken}
                  </Text>
                </Flex>
              </Box>
              <TextField.Root
                style={{ width: "100%", fontSize: "16px", height: "45px" }}
                placeholder="0.0"
                type="number"
                value={getEstimatedAmount()}
                readOnly
                size="3"
              />
            </Flex>
          </Box>

          <Box style={{ marginTop: "12px" }}>
            <Text size="2" style={{ color: "#CEE3E4" }}>
              Rate: 1 {fromToken} = {getRate()} {toToken}
            </Text>
          </Box>

          <Button
            color="indigo"
            size="4"
            onClick={handleSwap}
            disabled={
              !amount || !selectedWalletAccount || isSwapping || !toToken
            }
            style={{
              background: "linear-gradient(45deg, #4DA2FF, #63C9B9)",
              borderRadius: "24px",
              color: "white",
              boxShadow: "0 4px 14px rgba(77, 162, 255, 0.4)",
              transition: "transform 0.2s, box-shadow 0.2s",
              marginTop: "16px",
              fontSize: "16px",
              padding: "0 20px",
              height: "50px",
            }}
            onMouseEnter={(e) => {
              if (amount && selectedWalletAccount && !isSwapping && toToken) {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 20px rgba(77, 162, 255, 0.5)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow =
                "0 4px 14px rgba(77, 162, 255, 0.4)";
            }}
          >
            {isSwapping
              ? `${operationString}...`
              : selectedWalletAccount
              ? operationString
              : `Connect Wallet to ${operationString}`}
          </Button>
        </Flex>
      </Card>
    </FeaturePanel>
  );
}
