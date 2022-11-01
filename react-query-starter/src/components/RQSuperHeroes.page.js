import { Link } from "react-router-dom";
import { useState } from "react";

import { useSuperHeroesData } from "../Hooks/useSuperHeroesData";

export const RQSuperHeroesPage = () => {
  const [isEnabled, setIsEnabled] = useState(false);

  const onSuccess = (data) => {
    console.log("success");
    console.log(data);
    if (data) setIsEnabled(true);
  };
  const onError = (error) => {
    console.log("error");
    console.log(error);
  };
  const { isLoading, data, isError, error, isFetching, refetch } =
    useSuperHeroesData(onSuccess, onError, isEnabled); //최소 2개 인수, id 그리고 api promise 함수를 반환하는 함수

  if (isLoading || isFetching) return <h2>Loading....</h2>;

  if (isError) return <h2>{error.message} </h2>;
  return (
    <>
      <h2>React Query Super Heroes Page</h2>
      <button onClick={refetch}>Fetch</button>
      {data?.data.map((hero) => {
        return (
          <div key={hero.id}>
            <Link to={`/rq-super-heroes/${hero.id}`}>{hero.name}</Link>
          </div>
        );
      })}
    </>
  );
};
