import axios from "axios";
import React from "react";

import { useQuery } from "react-query";

const fetchSuperHeroes = () => {
  return axios.get("http://localhost:4000/superheroes");
};

const fetchFriends = () => {
  return axios.get("http://localhost:4000/friends");
};

export const ParallelQueries = () => {
  const heroQuery = useQuery("super-heroes", fetchSuperHeroes);
  const friendsQuery = useQuery("friends", fetchFriends);

  console.log(friendsQuery);
  return <div>ParallelQueries.page</div>;
};
