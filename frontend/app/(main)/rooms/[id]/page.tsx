import Client from "./Client";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function RoomPage({ params }: Props) {
  const { id } = await params;

  return <Client roomId={id} />;
}
