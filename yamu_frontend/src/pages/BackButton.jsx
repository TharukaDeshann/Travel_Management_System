

export const BackButton = ({ navigate }) => {
const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Button onClick={handleGoBack} icon={<ArrowLeftOutlined />}>
      Back
    </Button>
  );
};
