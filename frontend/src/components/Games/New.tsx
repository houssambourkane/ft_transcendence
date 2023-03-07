import { Carousel, Embla, useAnimationOffsetEffect } from "@mantine/carousel";
import { Button, Image, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import { ContextModalProps } from "@mantine/modals";
import { IconRocket } from "@tabler/icons-react";
import { useContext, useState } from "react";
import toast from "react-hot-toast";
import { backgrounds } from "../../shared";
import { SocketContext } from "../../utils";

export const NewGame = ({
  context,
  id,
  innerProps,
}: ContextModalProps<{ user_id: string }>) => {
  const socket = useContext(SocketContext);
  const [embla, setEmbla] = useState<Embla | null>(null);
  const form = useForm({
    initialValues: {
      background: backgrounds[0],
    },
  });

  const onSubmit = async (values: typeof form.values) => {
    if (!socket) return;
    await toast.promise(
      socket
        ?.timeout(10000)
        .emitWithAck("game:create", { ...values, ...innerProps })
        .then((data) => {
          if (!data.done) throw new Error("Could not find a game");
          return data;
        }),
      {
        loading: "Creating game...",
        success: "Created game successfully!",
        error: "Creating failed",
      }
    );
    context.closeModal(id);
  };

  useAnimationOffsetEffect(embla, 200);

  return (
    <>
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Text color="gray.9" size="sm" weight={500} mb="xs">
          Choose a background
        </Text>
        <Carousel
          onSlideChange={(i) =>
            form.setFieldValue("background", backgrounds[i])
          }
          loop
          withIndicators
          getEmblaApi={setEmbla}
        >
          {backgrounds.map((url, i) => (
            <Carousel.Slide key={i}>
              <Image
                sx={{
                  pointerEvents: "none",
                }}
                src={url}
              />
            </Carousel.Slide>
          ))}
        </Carousel>
        <Button
          fullWidth
          mt="lg"
          size="md"
          type="submit"
          leftIcon={<IconRocket size={20} />}
        >
          Start Playing
        </Button>
      </form>
    </>
  );
};
