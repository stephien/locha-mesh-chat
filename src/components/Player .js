import React, { Component } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Icon } from "native-base";
import Slider from "@react-native-community/slider";
import Sound from "react-native-sound";
import moment from "moment";
import { connect } from "react-redux";

class Player extends Component {
  constructor(props) {
    super(props);
    this.state = {
      play: false,
      duration: 0,
      reproduced: 0
    };
    sound = undefined;
  }

  componentDidMount = () => {
    this.sound = new Sound(this.props.path, "", error => {
      if (error) {

      } else {
        this.setState({
          duration: this.sound.getDuration()
        });
      }
    });
  };

  componentWillReceiveProps = props => {
    this.sound = new Sound(props.path, "", error => {
      if (error) {
        console.log("failed to load the sound", error);
      } else {
        this.setState({
          duration: this.sound.getDuration()
        });
      }
    });
  };

  componentDidUpdate = () => {
    if (this.state.play) {
      this.sound.getCurrentTime((seconds, isPlaying) => {
        this.setState({ reproduced: seconds });
      });
    }
  };

  _play = async () => {
    this.setState({ play: true });
    this.sound.play(success => {
      if (success) {
        this.setState({ play: false });
        setTimeout(() => {
          this.setState({ reproduced: 0 });
        }, 1);
      } else {
        console.log("playback failed due to audio decoding errors");
      }
    });
  };

  pause = () => {
    if (this.sound) {
      this.sound.pause();
    }

    this.setState({ play: false });
  };

  onSliderEditing = value => {
    if (this.sound) {
      this.sound.setCurrentTime(value);
      this.setState({ reproduced: value });
    }
  };

  render() {
    return (
      <View
        style={{ flexDirection: "row", alignItems: "center", marginTop: 15 }}
      >
        <TouchableOpacity onPress={() => this._play()}>
          {!this.state.play && (
            <Icon name="play" style={{ color: "#616161" }} />
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => this.pause()}>
          {this.state.play && (
            <Icon name="pause" style={{ color: "#616161" }} />
          )}
        </TouchableOpacity>
        <Slider
          style={{ width: 150 }}
          minimumValue={0}
          value={this.state.reproduced}
          onValueChange={this.onSliderEditing}
          maximumValue={this.state.duration}
          minimumTrackTintColor="#FAB300"
          thumbTintColor="#FAB300"
        />

        {(this.state.play || this.state.reproduced > 0) && (
          <Text style={{ position: "absolute", top: 33 }}>
            {moment
              .utc((this.state.duration - this.state.reproduced) * 1000)
              .format("m:ss")}
          </Text>
        )}

        {!this.state.play && this.state.reproduced < 1 && (
          <Text style={{ position: "absolute", top: 33 }}>
            {moment.utc(this.state.duration * 1000).format("m:ss")}
          </Text>
        )}
      </View>
    );
  }
}

const mapStateToProps = state => ({
  chat: state.chats.chat,
  chatSelected: state.chats.seletedChat
});

export default connect(
  mapStateToProps,
  null
)(Player);
