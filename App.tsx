import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, Text, View, Button, FlatList, TextInput } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

//Stack para la navegacion de la app
const Stack = createNativeStackNavigator();
const url = "http://127.0.0.1:5000/";

//Componente que vamos a mostrar en cada elemento de la lista
const Tarjeta = (props:any) => {
  return(<View>
      <Button
        title={props.name}
        onPress={() => {
          props.navigation.navigate('Detalle', {id: props.id})
        }}
      />
    </View>);
}

//Componente que se muestra en la pagina de detalles de alguna tarjeta
const DetalleTarjeta = (props:any) =>{
  return(<View>
    <Text>ID: {props.id}</Text>
    <Text>Titulo: {props.name}</Text>
    <Text>Descripcion: {props.texto}</Text>
  </View>);
}

//Funcion asincrona para hacer el logout
const logout = async () => {
  var headers = new Headers();

  // obtener valores locales
  var user = await AsyncStorage.getItem("user");
  var token = await AsyncStorage.getItem("token");

  // Se a;ade al header el email y el token
  headers.append("Authorization", user + ":" + token);
  var response = await fetch('http://127.0.0.1:5000/logout', {headers: headers});

  // mantenimiento local
  await AsyncStorage.removeItem("user");
  await AsyncStorage.removeItem("token");
  await AsyncStorage.setItem("logged", "n");
}

//App principal que solo tiene la navegacion, llama a los componentes de cada pagina
export default function App() {
  return(
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen 
          name="Login"
          component={Login}
        />
        <Stack.Screen 
          name="Principal"
          component={Principal}
        />
        <Stack.Screen 
          name="Detalle"
          component={Detalle}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

//Componente del login con el formulario de iniciar sesion
const Login = ({navigation} : any) => {
  //Estados
  const[user, setUser] = useState("");
  const[password, setPassword] = useState("");
  const[mensajeDeError, setMensajeDeError] = useState(false);

  //Funcion para revisar si ya se ha iniciado sesion o no
  const checkLogIn = async() => {
    try {
      const value = await AsyncStorage.getItem('logged')
      if(value !== null) {
        if(value === "y")
          navigation.navigate("Principal")
        else{
          return
        }
      }
    } catch(e) {
      return
    }
  }
  
  checkLogIn()

  //funcion para hacer el request de login
  const login = async() => {
    // vamos a seguir usando fetch
    
    // para mandar info vamos a crear un objeto formdata
    const formData = new FormData();
    formData.append('email', user);
    formData.append('pass', password);

    // solicitud con POST y con datos 
    var response = 
    await fetch('http://127.0.0.1:5000/login', {
      method: 'POST',
      body: formData
    });

    //Si el login fue aceptado actualizar datos
    if(response.status == 200){
      const datosLogin = await response.json(); 
      // también se puede guardar en memoria
      await AsyncStorage.setItem("logged", "y");
      await AsyncStorage.setItem("user", user);
      await AsyncStorage.setItem("token", datosLogin.token);
      await AsyncStorage.setItem("validez", datosLogin.caducidad);
      navigation.navigate('Principal')
    }else{
      await AsyncStorage.setItem("logged", "n");
      setMensajeDeError(true);
    }
  }

  return (
    //Vista del formulario
    <View style={styles.container}>
      {mensajeDeError&&<Text style={{color:'red'}}>Error Credenciales Invalidas</Text>}
      
      <TextInput 
        placeholder='user'
        onChangeText={text => {
          setUser(text);
        }}
      />
      <TextInput 
        placeholder='password'
        secureTextEntry={true}
        onChangeText={text => {
          setPassword(text);
        }}
      />
      <Button 
        title="LOGIN"
        onPress={() => {
          login();
        }}
      />
    </View>
  );
}
//Componente de la pagina/pantalla principal
const Principal = ({navigation} : any) => {
  //estados
  const[cargando, setCargando] = useState(true);
  const[datos, setDatos] = useState([]);
  //Revisar si se ha iniciado sesion, sino llevarlo al login
  const checkLogIn = async() => {
    try {
      const value = await AsyncStorage.getItem('logged')
      if(value !== null) {
        if(value === "n")
          navigation.navigate("Login")
        else{
          return
        }
      }
    } catch(e) {
      return
    }
  }
  
  checkLogIn()
  
  //Funcion para hacer fetch al backend
  const solicitud = async() => {
    var headers = new Headers();

    // obtener valores locales
    var user = await AsyncStorage.getItem("user");
    var token = await AsyncStorage.getItem("token");

    headers.append("Authorization", user + ":" + token);
    var respuesta = await fetch(url, {headers: headers});
    setDatos(await respuesta.json());
    setCargando(false);
  }
  //If para solo cargar los datos 1 vez, se puede reemplazar haciendo un useEffect de React
  if(cargando){
    solicitud();
  }

  //Se regresa la vista con una lista de componentes de tipo tarjeta con los datos del fetch
  return (
    <View style={styles.container}>
      {cargando && <Text>CARGANDO...</Text>}
      {datos && (
        <FlatList 
          data={datos}
          renderItem={({item} : any) =>
            <Tarjeta
              //Los datos se pasan como props
              name={item.name}
              texto={item.texto}
              id={item.id}
              navigation={navigation}
            />
            
          }
        />
        
      )}
      <Button
        title={'Logout'}
        onPress={() => {
          logout();
          navigation.navigate("Login");
        }}
      />
      
      <StatusBar style="auto" />
    </View>
  );
}

//Componente de la pagina/pantalla Detalle
const Detalle = ({navigation, route} : any) => {
  //Estados
  const[cargando, setCargando] = useState(true);
  const[datos, setDatos] = useState([]);

  //Revisar si se ha iniciado sesion, sino llevarlo al login
  const checkLogIn = async() => {
    try {
      const value = await AsyncStorage.getItem('logged')
      if(value !== null) {
        if(value === "n")
          navigation.navigate("Login")
        else{
          return
        }
      }
    } catch(e) {
      return
    }
  }
  
  checkLogIn()

  //Funcion para hacer fetch al backend con metodo GET
  const solicitud = async() => {
    var headers = new Headers();
    // Authorization Basic

    // obtener valores locales
    var user = await AsyncStorage.getItem("user");
    var token = await AsyncStorage.getItem("token");

    headers.append("Authorization", user + ":" + token);
    var respuesta = await fetch(url+"getData/"+route.params.id, {method: 'GET', headers: headers});
    setDatos(await respuesta.json());
    setCargando(false);
  }
  //If para solo cargar los datos 1 vez
  if(cargando){
    solicitud();
  }

  //Se regresa la vista con el componente DetalleTarjeta y un boton para ir a la pagina/pantalla principal
  return (
    <View style={styles.container}>
      {cargando && <Text>CARGANDO...</Text>}
      {!cargando && <DetalleTarjeta
                    name={datos[0].name}
                    id={datos[0].id}
                    texto={datos[0].texto}
                    />}
      <Button
        title={"Regreso"}
        onPress={() => {
          navigation.navigate('Principal');
        }}
      />
    </View>
  );
}

//Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
