import axios from "axios";
import React from "react";

import { useQuery } from "react-query";

const fetchUserByEmail = (email) => {
  return axios.get(`http://localhost:4000/users/${email}`);
};
const fetchCoursesByChannelId = (channelId) => {
  return axios.get(`http://localhost:4000/channels/${channelId}`);
};
export const DependentQueriesPage = ({ email }) => {
  const { isLoading, data: user } = useQuery(["users", email], () =>
    fetchUserByEmail(email)
  );
  if (isLoading) {
    <div>Loading...</div>;
  }
  const channelId = user?.data.channelId;

  const { data: channel } = useQuery(
    ["courses", channelId],
    () => fetchCoursesByChannelId(channelId),
    {
      enabled: !!channelId,
    }
  );

  return (
    <div>
      <h2>DependentQueriesPage</h2>
      <div>{channel?.data.courses[1]}</div>
      <div>{/* {data?.data.name} - {data?.data.alterEgo} */}</div>
    </div>
  );
};
