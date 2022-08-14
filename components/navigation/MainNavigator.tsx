import React, {useEffect, useState} from 'react';
import { ActivityIndicator, Animated, FlatList, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { Observable } from 'rxjs';

function AboutScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{fontSize: 24}}>Test App for CloudFactory</Text>
    </View>
  );
}

function QuotesScreen() {
  interface ItemType {
    token: string,
    id: number,
    last: number,
    percentChange: number
  }
  const [items, setItems] = useState<Array<ItemType>>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)


  const getQuotes = async () => {
    const rawData = await fetch('https://poloniex.com/public?command=returnTicker')
    const data = await rawData.json()
    const render = Object.keys(data).map((key) => {
      const assets = key.split('_')
      if(assets[0] === 'USDT'){
        const item: ItemType = data[key]
        return {
          token: `${assets[1]}`, 
          id: item.id,
          last: item.last,
          percentChange: item.percentChange
        }
      }
    }).filter((item) => item !== undefined)

    setItems(render as ItemType[])
  }

  const observable = new Observable(subscriber => {
    setIsLoading(true)
    subscriber.next();
    setInterval(() => {
      subscriber.next();
    }, 5000);
    setIsLoading(false)
  });

  useEffect(() => {
    observable.subscribe({
      next() { 
        getQuotes()
      },
    });
    
    return () => {}
  }, [])

  const renderItem = ({ item }: any) => {
    const isChangeNegative =  /-/.test(item.percentChange);
    return (
      <View style={{flexDirection: 'row'}}>
        <Text style={{fontSize: 20, width: 100}}>{item.token} </Text>
        <Animated.Text style={{fontSize: 18, width: 200}}>{item.last} USDT </Animated.Text>
        <Text style={{fontSize: 18, color: isChangeNegative ? 'red' : 'green'}}>{item.percentChange.substring(0, 5)}%</Text>
      </View>
    )
  };

  return isLoading ? <ActivityIndicator style={{alignSelf: 'center', height: '100%'}} size="large" /> : (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item:ItemType) => item.id.toString()}
      />
    </View>
  );
}

const Tab = createBottomTabNavigator();

export default function MainNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator 
        screenOptions={{
          tabBarLabelStyle: {
            fontWeight: "bold",
            fontSize: 16,
            height: '70%',
          },
          tabBarIconStyle: { display: "none" },
        }}
      >
        <Tab.Screen 
          name="About"
          component={AboutScreen} 
        />
        <Tab.Screen 
          name="Quotes" 
          component={QuotesScreen}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}