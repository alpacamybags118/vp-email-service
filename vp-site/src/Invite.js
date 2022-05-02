import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

function Invite() {
  const [resp, initResp] = useState([])
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  if(!token) {
    return (
      <h1>Something went wrong :( Token not found!</h1>
    )
  }

  const fetchData = async () => {
    await fetch(`https://vpapi.distortionaladdict.com/invite?token=${token}`, {
      body: JSON.stringify(''),
      origin: 'localhost',
      method: 'POST'
      }
    )
    .then((resp) => {
      if(resp.status !== 200) {
        console.log('err')
        throw new Error('Request failed!')
      }

      resp.text();
    });
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    fetchData()
      .then((res) => {
        initResp(<h1>good</h1>)
      })
      .catch((err) => {
        console.error(err);
        initResp(<h1>good</h1>)
      })
  }, [])

  return(
    resp
  );
}

export default Invite