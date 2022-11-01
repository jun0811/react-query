import { useParams } from "react-router-dom";

import React from "react";
import { useSuperHeroData } from "../Hooks/useSuperHeroData";

export const RQSuperHeroPage = () => {
  const { heroId } = useParams();
  const { isLoading, data } = useSuperHeroData(heroId);
  console.log(data);
  if (isLoading) {
    <div>Loading...</div>;
  }

  return (
    <div>
      <h2>RQSuperHero Details</h2>

      <div>
        {data?.data.name} - {data?.data.alterEgo}
      </div>
    </div>
  );
};
