import { useParams } from "react-router-dom";
import { CategoryPage } from "./CategoryPage";

export const KeywordPage = () => {
  const { keywordId, keywordName } = useParams();

  if (!keywordId || !keywordName) {
    return null;
  }

  return (
    <CategoryPage
      categoryType="keyword"
      categoryId={keywordId}
      title={decodeURIComponent(keywordName)}
    />
  );
};
