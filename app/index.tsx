import { Redirect } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import ScreenLoading from '../components/ScreenLoading';
import {useEffect,useState} from "react"


export default function Index() {
  const { isAuthenticated, loading } = useAuth();
   const [ready, setReady] = useState(false);
   
    

 useEffect(() => {
    
    const minimumDelay = new Promise(resolve => 
      setTimeout(resolve, 0)
    );
    
    const authReady = !loading ? Promise.resolve() : 
      new Promise(resolve => {
        const checkAuth = setInterval(() => {
          if (!loading) {
            clearInterval(checkAuth);
            resolve();
          }
        }, 100);
      });

    Promise.all([minimumDelay, authReady]).then(() => {
      setReady(true);
    });
  }, [loading]);
// 
//   if (!ready) {
//     return <ScreenLoading />;
//   }

  if (isAuthenticated) {
    console.log(" Redirection vers (main)");
    return <Redirect href="/(main)" />;
  } else {
    console.log(" Redirection vers (auth)");
    return <Redirect href="/(auth)" />;
  }
}