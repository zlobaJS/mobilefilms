import { useParams } from "react-router-dom";
import { CategoryPage } from "./CategoryPage";

export const KeywordPage = () => {
  const { keywordId, keywordName } = useParams();

  return (
    <CategoryPage
      categoryType="keyword"
      categoryId={keywordId}
      title={decodeURIComponent(keywordName || "")}
    />
  );
};
