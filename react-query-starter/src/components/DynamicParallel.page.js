import axios from "axios";
import React from "react";

import { useQueries } from "react-query";

const fetchSuperHero = ({ queryKey }) => {
  const heroId = queryKey[1];
  return axios.get(`http://localhost:4000/superheroes/${heroId}`);
};

export const DynamicParallelPage = ({ heroIds }) => {
  const queryResults = useQueries(
    heroIds.map((id) => {
      return {
        queryKey: ["super-hero", id],
        queryFn: () => fetchSuperHero(id),
      };
    })
  );
  console.log(queryResults);
  return (
    <div>
      <h2>RQSuperHero Details</h2>

      <div>{/* {data?.data.name} - {data?.data.alterEgo} */}</div>
    </div>
  );
};
