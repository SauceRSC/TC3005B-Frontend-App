import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, Text, View, Button, FlatList } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

//Stack para la navegacion de la app
const Stack = createNativeStackNavigator();

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

//App principal que solo tiene la navegacion, llama a los componentes de cada pagina
export default function App() {
  return(
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
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

//Componente de la pagina/pantalla principal
const Principal = ({navigation} : any) => {
  //estados
  const[cargando, setCargando] = useState(true);
  const[datos, setDatos] = useState([]);

  //Funcion para hacer fetch al backend
  const solicitud = async() => {
    var respuesta = await fetch("http://172.22.130.147:5000/");
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
      <StatusBar style="auto" />
    </View>
  );
}

//Componente de la pagina/pantalla Detalle
const Detalle = ({navigation, route} : any) => {
  //Estados
  const[cargando, setCargando] = useState(true);
  const[datos, setDatos] = useState([]);
  //Funcion para hacer fetch al backend con metodo GET
  const solicitud = async() => {
    var respuesta = await fetch("http://172.22.130.147:5000/getData/"+route.params.id, {method: 'GET'});
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
