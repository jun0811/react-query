import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "react-query";

const fetchSuperHeroes = async () => {
  return axios.get("http://localhost:4000/superheroes");
};
const addSuperHero = async (hero) => {
  return axios.post("http://localhost:4000/superheroes", hero);
};

export const useSuperHeroesData = (onSuccess, onError, enabled) => {
  return useQuery("super-heroes", fetchSuperHeroes, {
    onSuccess: onSuccess,
    onError: onError,
    enabled: enabled,
  });
};

//mutation은 키가 필요 x ,
export const useAddSuperHeroData = () => {
  const queryClient = useQueryClient();
  return useMutation(addSuperHero, {
    // onSuccess: (data) => {
    // queryClient.setQueryData("super-heroes", (prevData) => {
    //   return {
    //     ...prevData,
    //     data: [...prevData.data, data.data],
    //   };
    // });

    // },
    onMutate: async (newHero) => {
      await queryClient.cancelQueries("super-heroes"); // 새로 고침 취소 => 업데이트 덮어씌우기 방지
      //롤백을 위한 쿼리 데이터 가져오기
      const previousHeroData = queryClient.getQueriesData("super-heroes");
      queryClient.setQueryData("super-heroes", (prevData) => {
        return {
          ...prevData,
          data: [...prevData.data, { id: prevData?.data + 1, ...newHero }],
          //id는 여기선 단순히 +1 증가해주면 되지만, uuid를 써야하는게 좋다.
        };
      });
      return {
        previousHeroData,
      };
    },
    //context는 onMutate에 사용한 이전 변수에 엑세스 가능, 오류 있을 때 사용
    onError: (_err, _hero, context) => {
      queryClient.setQueryData("super-heroes", context.previousHeroData);
    },
    onSettled: () => {
      queryClient.invalidateQueries("super-heroes"); // 서버와 데이터 동기화
    },
  });
};
