## 사용 이유

- 서버, 클라이언트 데이터를 분리
- 캐싱, 값 업데이트, 에러핸들링 등 비동기 과정을 더욱 편하게 하는데 사용

## 장점

- 캐싱
- get을 한 데이터에 대해 update를 하면 자동으로 get을 다시 수행한다. (예를 들면 게시판의 글을 가져왔을 때 게시판의 글을 생성하면 게시판 글을 get하는 api를 자동으로 실행 )
- 데이터가 오래 되었다고 판단되면 다시 get (`invalidateQueries`)
- 동일 데이터 여러번 요청하면 한번만 요청한다. (옵션에 따라 중복 호출 허용 시간 조절 가능)
- 비동기 과정을 선언적으로 관리할 수 있다.
- react hook과 사용하는 구조가 비슷하다.

## 셋팅

 **설치 : `yarn install react-query`**

```jsx
// src/index.js
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";

const queryClient = new QueryClient();

ReactDOM.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      {/* devtools */}
      <ReactQueryDevtools initialIsOpen={true} />
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
```

## 중요한 기본 사항

기본적으로 React Query는 정상적인 기본값으로 구성됩니다. 이러한 defalut value는 학습에 어려움을 겪게 할 수 있습니다. 

1. `useQuery` or `useInfiniteQuery` 를 통한 쿼리 인스터스는 **기본적으로 캐시된 데이터를 오래된 것으로 간주합니다. ⇒ 이것을 staleTime옵션을 통해 전역 또는 쿼리별로 캐시 주기를 바꾸어줄 수 있습니다.**
2. 쿼리가 백그라운드에서 다시 가져오는 경우는 다음과 같습니다.
    - New instances of the query mount
        - 작동 되는 경우 : query key에 react state를 주고, state가 바뀌면 다시 fetch
    - The window is refocused
        - 작동 되는 경우 : 유저가 다른 작업하다가 다시 typed에 돌아오면 다시 fetch
    - The network is reconnected.
        - 작동 되는 경우 : 네트워크가 끊겼다가 다시 연결되면 fetch됨
    - The query is optionally configured with a refetch interval.
        - refetch 설정을 명시적으로 준 경우.
    - 추가적으로, 고의적으로 invalidate하여 refetching하는 것이 실전에서 자주 사용되는 편임. CUD가 이루어진 직후 새로운 데이터를 받아오기 위해 invalidate를 함. => 즉각 stale이 되어 refetching될 수 있음.
    
    `refetchOnWindowFocus` 로 인해 예상지 못한 refetch를 경험할 수 있다. 개발중에는 특히 devtools와 앱사이를 오고가며 포커스가 바뀌며 트리거가 동작하므로 더 주의
    
3. 더 이상 active하지 않는 인스터스를 가진 query는 `inactive`가 되어 캐쉬에 남아있게 됩니다. **(처음 캐쉬에 저장)**  
4. 기본적으로 5분의 garbage collector 타임을 갖습니다. `**cacheTime for queries to something other than 1000 * 60 * 5**`
5. **실패한 쿼리는 자동으로 3번 재시도되며, exponential backoff delay이 발생한다.**
    
    ⇒ 이는 변경이 가능하며, retry 및 retryDelay옵션을 다른 값으로 변경이 가능하다.
    

## 사용

### 1. fetchData with useQuery

> get api
> 

```jsx
const { isLoading, data } = useQuery("super-heroes", fetchSuperHeroes); 
//최소 2개 인수, id 그리고 api promise 함수를 반환하는 함수

  if (isLoading) return <h2>Loading....</h2>;
  return (
    <>
      <h2>React Query Super Heroes Page</h2>
      {data?.data.map((hero) => {
        return <div key={hero.name}> {hero.name}</div>;
      })}
    </>
  );
```

### 2. Handling Query Error

기존엔 error를 위한 스테이트를 받을어서 fatch의 에러 케이스에서 setState를 통해 상태를 렌더링을 관리하였다.  쿼리에서는 `isError, erroe` 값을 통해 케이스를 쉽게 가져갈 수 있다.

```jsx
const { isLoading, data, isError, error } = useQuery("super-heroes", fetchSuperHeroes);

if (isLoading) return <h2>Loading....</h2>;

if (isError) return <h2>{error.message} </h2>;
```

이때 에러가 낫을때, 오랫동안 로딩이 도는 것을 볼수가 있는데 이것은 error시 기본적으로 3번을 요청하기 때문이다. 

이와같이 정말 간단하게 error 케이스를 처리할 수 있습니다.

### 3. DevTools

1. app.js `import { ReactQueryDevtools } from "react-query/devtools";`  
2. Provider 태그 안에 `ReactQueryDevtools태그`를 포함합니다.
    
    ```jsx
    <QueryClientProvider>	
    		....
    	<ReactQueryDevtools initialIsOpen={false}/>
    </QueryClientProvider>
    ```
    

## 

### 4. Cache

`react-query`는 모든 쿼리 결과를 5분(default)동안 캐시되고 이것을 사용합니다.

- 쿼리키를 통해 캐싱하게 된다.
- 백그라운드에서 리패치하고 가져온다.  `isFetching`을 통해 데이터가 바뀌었는지 확인 가능
- 캐시 타임은 기본적으로 5분,  config ⇒ cacheTime으로 변경이 가능
    
    ```tsx
    const { isLoading, data, isError, error } = useQuery(
        "super-heroes",
        fetchSuperHeroes,
        { cacheTime: 3000 }
      );
    ```
    
    cache타임 이후로는 가비지컬렉터로인해 삭제
    

### 5. **Stale Time**

서버데이터가 자주 변경되지 않고, 사용자에게 오래된 데이터가 표시되어도 괜찮다고 가정을 한다면,

캐시된 쿼리 결과를 사용해도 좋습니다.

```tsx
const { isLoading, data, isError, error } = useQuery(
    "super-heroes",
    fetchSuperHeroes,
    { staleTime: 30000 }
  )
```

`staleTime` 을 설정했다면 이제 캐쉬된 데이터는 그 시간 동안 최신데이터로 유지됩니다. 

기본 값은 0으로 되어있다. 개발자는 본인의 데이터를 본인이 제일 잘알기 때문에 알아서 조정하면 된다.

### 6. **Refetch Defaults**

- Mount 될때, (`refetchOnMount`)
    
    이 confing는 boolean | `always` 로 값을 정할수 있고.
    
    true로하면 해당 페이지가 마운트될때 refetch한다. (true로 두는 것을 가장 추천한다)
    
- 포커스 될때, (`refetchOnWindowFocus`)
    
    react-query는 포커스가 나갔다가 다시 잡히면 기본적으로 refetch를 한다.
    
    이 confing는 boolean | `always` 로 값을 정할수 있고. 
    
    true로하면 창이 포커스될때 refetch한다. (true로 두는 것을 가장 추천한다)
    

### 7. Polling

- `refetchInterval` : 단위 ms ⇒ 시간 설정할때마다 쿼리를 refetch

이렇게 설정한 polling은 백그라운드에선 기본적으로 동작하지않으므로 `**refetchIntervalBackground` 를 true로 바꿔줘야 한다.**

### 8. 이벤트로 쿼리 가져오기

refetch로 쿼리실행함수로 가져올수있다.

```tsx
const { isLoading, data, isError, error, isFetching, **refetch** } = useQuery(
    "super-heroes",
    fetchSuperHeroes,
    {
      enabled: false,
    }
  );
```

`<button onClick={refetch}>Fetch</button>` 으로 이벤트에 함수를 주입하면 끝!

이렇게 이벤트로 refetch를 한다면, 로딩 조건에 `isFetching` 까지 같이 넣어줘야 Loading 분기를 볼 수 있다.

```tsx
if (isLoading || isFetching) return <h2>Loading....</h2>;
```

### 9. Success and Error Callback

react-query는 쿼리가 끝난 시점 이후에 side Effect를 작성할 수 있다. 

success, error 함수를 작성하고 config에 주입하면 된다.

```jsx
const onSuccess = (data) => {
    console.log("success");
    console.log(data);
  };
  const onError = (error) => {
    console.log("error");
    console.log(error);
  };
  const { isLoading, data, isError, error, isFetching, refetch } = useQuery(
    "super-heroes",
    fetchSuperHeroes,
    {
      onSuccess: onSuccess,
      onError: onError,
    }
  );
```

뿐만 아니라 쿼리 결과(객체)를 인자로 받아 처리까지 함수 있다.

### 10. data Transformation

`**select**` config를 통해서 특정 데이터를 필터링하거나 트랜스폼을 할 수 있습니다. 

```tsx
{
  onSuccess: onSuccess,
  onError: onError,
  select: (data) => {
    return data.data.map((hero) => hero.name);
  },
}
```

위처럼 select는 res를 받아 가공할 수 잇습니다. select의 return값이 react-query의 data로 들어옵니다.

이를 위해 일부만 반환하든가 변환하든가 자유롭게 가공할 수 있습니다.

### 11. Custom Query Hook

동일한 데이터를 가져오기를 재사용할때 config가 다르게 필요할 수 있습니다. 

코드 복사없이 Cumstom Query Hook을 만들어보는것을 해봅시다.

보통 customHooks는 `**src/hooks` 폴더 안에 넣어줍니다.** 

1. useHeroesData라는 파일을 만들어줍시다.
2. 기존 작성했던 api 호출과 관련된 코드들을 가져옵니다.
    
    ```tsx
    //useHeroesData.js
    import axios from "axios";
    import { useQuery } from "react-query";
    
    const fetchSuperHeroes = async () => {
      return axios.get("http://localhost:4000/superheroes");
    };
    
    // onSuccess, onError, enabled처럼 상황에 따라 커스텀이 될 수 있는 부분을 변수로 받습니다.
    export const useSuperHeroesData = (onSuccess, onError, enabled) => {
      return useQuery("super-heroes", fetchSuperHeroes, {
        onSuccess: onSuccess,
        onError: onError,
        select: (data) => {
          return data.data.map((hero) => hero.name);
        },
        enabled: enabled,
      });
    }; 
    ```
    
3. 활용
    
    ```tsx
    const { isLoading, data, isError, error, isFetching, refetch } =
        useHeroesData(onSuccess, onError, isEnabled); //최소 2개 인수, id 그리고 api promise 함수를 반환하는 함수
    ```
    

이처럼 기존의 코드에 만든 **Hooks**를 붙여주면 간단하게 재사용되는 **Hooks**를 사용할 수 있게 됩니다.

### 12. Query by Id

id를 쿼리에 이용하기.

상품 상세와 같이 item의 id를 이용하여 get호출을 해야하는 경우에 react-query를 어떻게 사용하야 할까?

```tsx
// hooks/useSuperHeroData.js
import { useQuery } from "react-query";
import axios from "axios";

const fetchSuperHero = ({ queryKey }) => {
  const heroId = queryKey[1];
  return axios.get(`http://localhost:4000/superheroes/${heroId}`);
};
export const useSuperHeroData = (heroId) => {
  return useQuery(["super-hero", heroId], fetchSuperHero);
};
// -------------------- 또 다른 방법 ---------------------------- //
// const fetchSuperHero = (heroId) => {
//	  return axios.get(`http://localhost:4000/superheroes/${heroId}`);
//	};

// export const useSuperHeroData = (heroId) => {
//   return useQuery(["super-hero", heroId], () => fetchSuperHero(heroId));
// };
```

queryKey를 자동으로 인자에 전달하기 때문에 이를 받아서 인덱싱을 통해 id를 접근하여 코드를 작성할 수 있다.

### 13. Parallel Queries

```tsx
const fetchSuperHeroes = () => {
  return axios.get("http://localhost:4000/superheroes");
};

const fetchFriends = () => {
  return axios.get("http://localhost:4000/friends");
};

export const ParallelQueries = () => {
  const heroesQuery = useQuery("super-heroes", fetchSuperHeroes);
  const friendsQuery = useQuery("friends", fetchFriends);
```

- 병렬적으로 받을때, 개별적으로 fetch함수를 작성하고 키를 다르게 해서 다루면 된다.
- 구조적으로 변수를 받아온다면,

```tsx
const fetchSuperHeroes = () => {
  return axios.get("http://localhost:4000/superheroes");
};

const fetchFriends = () => {
  return axios.get("http://localhost:4000/friends");
};

export const ParallelQueries = () => {
  const { data:heroes } = useQuery("super-heroes", fetchSuperHeroes);
  const { data:friends } = useQuery("friends", fetchFriends);
	.....
}
```

이렇게 작성도 가능하다.

### 14. 동적 병렬

```tsx
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
// queryResults = [ {query결과1} , {query결과2}, .... ]
```

위와 같은 문법으로 병렬 결과를 받을 수 있다.

### 15. dependent Query

dependent(혹은 serial )쿼리들은 이전에 완료가 된 쿼리에 의존된 쿼리를 말합니다.

이를 잘 구현하기 위해선 `enabled` 옵션을 잘 사용해야합니다. 

```tsx
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
		// The query will not execute until the channelId exists
    enabled: !!channelId,
  }
); 
 *// isIdle will be `true` until `enabled` is true and the query begins to fetch.*
```

### 16. pagiNation Query

- `**keepPreviousData` : 새로운 데이터를 요청하는 동안에도 이전 데이터(마지막 데이터)를 저장할수 있게 하는 config**

pagination을 간략하게 구현해보겠습니다.

**`db.json`**

```tsx
"colors": [
    {
      "id": 1,
      "label": "red"
    },
    {
      "id": 2,
      "label": "blue"
    },
    {
      "id": 3,
      "label": "green"
    },
    {
      "id": 4,
      "label": "white"
    },
    {
      "id": 5,
      "label": "black"
    },
    {
      "id": 6,
      "label": "purple"
    },
    {
      "id": 7,
      "label": "yellow"
    },
    {
      "id": 8,
      "label": "skyblue"
    }
  ]
```

위 데이터 처럼 데이터를 받아올 수 있도록 구성하였습니다.

다음은 pagination을 간단하게 구현해보고 `keepPreviousData`를 활용해보겠습니다.

```tsx
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
      <div>{isFetching && "Loading"}</div> // 데이터 불러오는 과정동안 보이지만 이전 데이터도 보여줄 수 있다.
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
```

json-server에서 limit, page 옵션으로 2개씩 받아올수 있도록 하여 유사하게 구현해보았습니다.

`**keepPreviousData: true` 을 통해 직전 데이터를 가지고 있을 수 있습니다. 로딩 과정동안 이전데이터를 보여주면서 사용자에게 좋은 화면을 보여줄수 있습니다.** 

### 17. ****Infinite Queries****

- **`data.pages`** 가져온 페이지를 포함하는 배열. pages안에 각각 한번의 리로드에 들어오는 데이터들이 배열로 들어있다.
    
    ![스크린샷 2022-11-03 오후 4.38.53.png](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/5ed5aa6e-3035-4cf0-8b98-6b8d04e17d6d/%E1%84%89%E1%85%B3%E1%84%8F%E1%85%B3%E1%84%85%E1%85%B5%E1%86%AB%E1%84%89%E1%85%A3%E1%86%BA_2022-11-03_%E1%84%8B%E1%85%A9%E1%84%92%E1%85%AE_4.38.53.png)
    
- **`data.pageParams`**페이지를 가져오는 데 사용되는 페이지 매개변수를 포함하는 배열
- **`fetchNextPage와 fetchPreviousPage`** 함수를 사용할 수 있습니다 . ( 이전, 다음 데이터 패치 )
- **`getNextPageParam, getPreviousPageParam, fetchNextPage, fetchPreviousPage`** 로드할 데이터가 더 있는지와 가져올 정보가 있는지 확인하는 데 및 옵션을 모두 사용할 수 있습니다.
    
    이 정보는 쿼리 함수에서 추가 매개변수로 제공됩니다(또는 함수를 호출할 때 선택적으로 재정의될 수 있음) .
    
- **`hasNextPage` 를 통해 다음 쿼리가 있는지 없는지 알수가 있습니다. ( boolean값)**
    
    **`getNextPageParam` 의 리턴값이 undefined일 때 조건을 설정해 쿼리의 끝을 알 수 있습니다.** 
    
    ```tsx
    useInfiniteQuery("colors", fetchColors, {
    	getNextPageParam: (_lastPage, pages) => {
    	  if (pages.length < 4) return pages.length + 1;
    		  else return undefined; // 페이지 끝이 4로 가정했을 때, 페이지 길이가 4보다 커진다면, undefined를 뱉게하여 hasNextPage가 false가 나오게 한다.
    	},
    	});
    ```
    
- **`isFetchingNextPage` 와 `isFetchingPreviousPage` 의** boolean값 ****은 백그라운드 새로 고침 상태와 추가 로드 상태를 구분하기 위해 사용됩니다.

사용예제 코드) 

```tsx
import { useInfiniteQuery } from "react-query";

const fetchColors = ({ pageParam = 1 }) => {
  return axios.get(`http://localhost:4000/colors?_limit=2&_page=${pageParam}`);
}; // 2개씩 

export const InfiniteQueriesPage = () => {
  const {
    isLoading,
    isError,
    data,
    error,
    hasNextPage,//
    fetchNextPage,
    isFetching,
    isFetchingNextPage,
  } = useInfiniteQuery(["colors"], fetchColors, {
    getNextPageParam: (_lastPage, pages) => {
      if (pages.length < 4) return pages.length + 1;
      else return undefined;
    },
  });
  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>{error.message}</div>;
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
```

### 18. Mutation

- get요청외에 데이터를 변경시키는 쿼리는 `useQuery`가 아닌 `useMutation` 을 사용한다.
- 리턴되는 **mutate 함수**를 실행함으로써 서버에 요청을 보낸다.

예시로 쉽게 배워보자

먼저 hook으로 작성 해본다.

```tsx
//mutation은 키가 필요 x ,
const addSuperHero = async (hero) => {
  return axios.post("http://localhost:4000/superheroes", hero);
};

export const useAddSuperHeroData = () => {
  return useMutation(addSuperHero);
};
```

 이제 활용할 차례

```tsx
...
const [name, setName] = useState();
const { mutate: addHero } = useAddSuperHeroData(undefined); // 

const handleAddHeroClick = () => {
  const hero = { name, alterEgo };
  addHero(hero);
  setName("");
  setAlterEgo("");
};
```

`handleAddHeroClick` 을 보면 param을 넘겨주어 mutate함수 ( addHero)를 실행시켜 post를 한다.

이렇게 데이터를 변경시킨후 화면에서는 업데이트가 되었을까??? → 아니다. 이를 다음 챕터에서 배워보자

### 19. ****Query Invalidation****

기존의 쿼리데이터가 캐싱되어있기 때문에 update를 하기 위해선 다시 호출을 하는 수 밖에 없었다.

하지만 react-query의 ****QueryClient의 `invalidateQueries` 를 이용해 서버 원격 데이터를 무효화시켜 refetch시켜주는 간단한 방법이 있습니다.** 

`예 )) queryClient.invalidateQueries({ queryKey: ['todos'] })` 

```tsx
export const useAddSuperHeroData = () => {
  const queryClient = useQueryClient();
  return useMutation(addSuperHero, {
    onSuccess: () => {
      queryClient.invalidateQueries("super-heroes");
    },// 성공시에 super-heroes키로 캐싱되어있던 쿼리를 refetch유도
  });
};
```

### 20. Handling Mutation Response

위처럼 쿼리를 무효화하여 refetch하는 방법도 있지만 재요청으로 resource 낭비가 있는 것도 분명한 사실입니다.

보통 mutate요청들은 보냈던 객체가 응답으로 그대로 오게됩니다.

이를 이용해서 기존 상태관리에 넣어주면 재요청없이 생성 데이터를 바로 화면에 보여줄 수 있습니다.

```tsx
export const useAddSuperHeroData = () => {
  const queryClient = useQueryClient();
  return useMutation(addSuperHero, {
    onSuccess: (data) => {
      queryClient.setQueryData("super-heroes", (prevData) => {
        return {
          ...prevData,
          data: [...prevData.data, data.data],
        };
      });
    },
  });
};
```

### 21. Optimistic Update

mutate이후 UI에서도 업데이트 할것이란 (낙관적인) 가정으로 미리 UI를 업데이트 시켜주고 서버를 통해 검증을 받고 `업데이트` Or `롤백`하는 방식
onMutate: async (newHero) => {
	// 새로 고침 취소 => 업데이트 덮어씌우기 방지
  await queryClient.cancelQueries("super-heroes"); 
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
    previousHeroData, // 이전 데이터 돌아가기 
  };
},
//context는 onMutate에 사용한 이전 변수에 엑세스 가능, 오류 있을 때 사용
onError: (_err, _hero, context) => {
  queryClient.setQueryData("super-heroes", context.previousHeroData);
},
onSettled: () => {
  queryClient.invalidateQueries("super-heroes"); // 서버와 데이터 동기화cu
},
