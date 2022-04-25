import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, Text, View, Button, FlatList } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

// everything is done through components



// props 
// la manera de agregar atributos parametrizables al componente 
const Tarjeta = (props:any) => {
  // los componentes regresan algún tipo de view
  return(<View>
      <Button
        title={props.name}
        onPress={() => {
          props.navigation.navigate('Detalle', {id: props.id})
        }}
      />
    </View>);
}

const DetalleTarjeta = (props:any) =>{
  return(<View>
    <Text>ID: {props.id}</Text>
    <Text>Titulo: {props.name}</Text>
    <Text>Descripcion: {props.texto}</Text>
  </View>);
}

export default function App() {
  // aquí dejamos el puro controlador de navegación
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

const Principal = ({navigation} : any) => {

  const[cargando, setCargando] = useState(true);
  const[datos, setDatos] = useState([]);

  const solicitud = async() => {

    var respuesta = await fetch("http://172.22.130.147:5000/");
    setDatos(await respuesta.json());
    setCargando(false);
  }
  if(cargando){
    solicitud();
  }

  return (
    <View style={styles.container}>
      {cargando && <Text>CARGANDO...</Text>}
      {datos && (
        <FlatList 
          data={datos}
          renderItem={({item} : any) =>
            <Tarjeta 
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

const Detalle = ({navigation, route} : any) => {
  const[cargando, setCargando] = useState(true);
  const[datos, setDatos] = useState([]);
  const solicitud = async() => {

    var respuesta = await fetch("http://172.22.130.147:5000/getData/"+route.params.id);
    setDatos(await respuesta.json());
    setCargando(false);
  }
  if(cargando){
    solicitud();
  }

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
