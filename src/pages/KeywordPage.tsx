import { useParams, useNavigate } from "react-router-dom";
import { CategoryPage } from "./CategoryPage";
import { useEffect } from "react";

export const KeywordPage = () => {
  const { keywordId, keywordName } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!keywordId || !keywordName) {
      navigate("/");
    }
  }, [keywordId, keywordName, navigate]);

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
