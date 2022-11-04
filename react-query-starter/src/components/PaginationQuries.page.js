import { useQuery } from "react-query";

import React, { useState } from "react";

import axios from "axios";

const fetchColors = (pageNumber) => {
  return axios.get(`http://localhost:4000/colors?_limit=2&_page=${pageNumber}`);
};

export const PaginationQuriesPage = () => {
  const [pageNumber, setPageNumber] = useState(1);
  const { isLoading, isError, data, error, isFetching } = useQuery(
    ["colors", pageNumber],
    () => fetchColors(pageNumber),
    {
      keepPreviousData: true,
    }
  );
  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>{error.message}</div>;

  return (
    <>
      <button
        onClick={() => setPageNumber((prev) => prev - 1)}
        disabled={pageNumber === 1}
      >
        {"<"}
      </button>
      <button
        onClick={() => setPageNumber((prev) => prev + 1)}
        disabled={pageNumber === 4}
      >
        {">"}
      </button>
      <div>{isFetching && "Loading"}</div>
      <div>
        {data?.data.map((color) => {
          return (
            <h2 key={color.id}>
              {color.id} - {color.label}
            </h2>
          );
        })}
      </div>
    </>
  );
};
