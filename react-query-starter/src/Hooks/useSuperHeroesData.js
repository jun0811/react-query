import axios from "axios";
import { useQuery } from "react-query";

const fetchSuperHeroes = async () => {
  return axios.get("http://localhost:4000/superheroes");
};

export const useSuperHeroesData = (onSuccess, onError, enabled) => {
  return useQuery("super-heroes", fetchSuperHeroes, {
    onSuccess: onSuccess,
    onError: onError,
    enabled: enabled,
  });
};
