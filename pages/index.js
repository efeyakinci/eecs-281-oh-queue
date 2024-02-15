import {useEffect} from "react";
import {router} from "next/client";

export default function Home() {
    useEffect(() => {
        router.replace('/queues/');
    })

  return (
      <div>
        Redirecting...
      </div>
  );
}
