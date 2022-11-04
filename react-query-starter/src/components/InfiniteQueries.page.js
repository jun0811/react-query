import { useInfiniteQuery } from "react-query";

import React, { Fragment, useState } from "react";

import axios from "axios";

const fetchColors = ({ pageParam = 1 }) => {
  return axios.get(`http://localhost:4000/colors?_limit=2&_page=${pageParam}`);
};

export const InfiniteQueriesPage = () => {
  const {
    isLoading,
    isError,
    data,
    error,
    hasNextPage,
    fetchNextPage,
    isFetching,
    isFetchingNextPage,
  } = useInfiniteQuery("colors", fetchColors, {
    getNextPageParam: (_lastPage, pages) => {
      if (pages.length < 4) return pages.length + 1;
      else return undefined;
    },
  });
  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>{error.message}</div>;
  console.log(hasNextPage);
  return (
    <>
      <button onClick={fetchNextPage} disabled={!hasNextPage}>
        Load More
      </button>
      <div>{isFetching && !isFetchingNextPage ? "Fetching...." : ""}</div>
      <div>
        {data?.pages.map((group, index) => (
          <Fragment key={index}>
            {group.data.map((color) => {
              return (
                <h2 key={color.id}>
                  {color.id} - {color.label}
                </h2>
              );
            })}
          </Fragment>
        ))}
      </div>
    </>
  );
};
