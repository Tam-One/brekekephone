import React, { Component } from 'react';
import { View, Button, Text, Icon } from 'native-base';
import {StyleSheet} from 'react-native';

import { std } from '../styleguide';

const st = StyleSheet.create({
  keyRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  keyCell: {
    justifyContent: 'center',
    width: "33.3%",
    height: "100%",
  },
  keyText: {
    fontSize: std.iconSize.md * 2 ,
    lineHeight: std.iconSize.lg * 3,
  },
  conPhoneCall: {
  	paddingTop: std.iconSize.md,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  btnCall: {
  	justifyContent: 'center',
  	borderRadius: std.iconSize.md *2,
  	width: std.iconSize.md * 3,
    height: std.iconSize.md * 3,
  }
});

const keys = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['*', '0', '#'],
];


class KeyPad extends Component {
	render() {
		return (
			<View>
				<View>
			    {keys.map((row, i) => (
			      <View style={st.keyRow} key={i}>
			        {row.map(key => (
			          <Button style={st.keyCell}  transparent dark key={key} >
			            <Text style={st.keyText}>{key}</Text>
			          </Button>
			        ))}
			      </View>
			    ))}
			  </View>
			  <View style={st.conPhoneCall}>
			    	<View style={st.btnCall}></View>
			    	<Button style={st.btnCall} success >
			    		<Icon name="call" type="MaterialIcons"/>
	          </Button>
	          <Button style={st.btnCall} transparent dark >
	            <Icon name="backspace" type="MaterialIcons"/>
	          </Button>
			    </View>
			</View>
		)
	}
}

export default KeyPad;
