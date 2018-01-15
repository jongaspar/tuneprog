import React, { Component } from 'react';
import { Text, TouchableHighlight, View } from 'react-native';



import uuidv4 from 'uuid/v4';

import ControlButton from './ControlButton';

import styles from './_styles_MasterControls';
import Icon from 'react-native-vector-icons/FontAwesome';

import {
  Player,
  Recorder,
  MediaStates
} from 'react-native-audio-toolkit';
import Sound from 'react-native-sound';


export default class MasterControls extends Component {
  constructor() {
    super();
    this.state = {
      isRecording: false,
      isPlaying: false,
    };
    this.recording = null;
    this.sound = null;

    this.currentFilename = null;
    this.currentSoundId = null;

    this.interval = null;

    this._pause = this._pause.bind(this)
    this._play = this._play.bind(this)
    this._record = this._record.bind(this)
    this._stop = this._stop.bind(this)
  }

  _pause() {
    this.sound.pause(() => {
      console.log('paused sound:', this.sound);
      clearInterval(this.interval)
      this.setState({isPlaying: false})
    })
  }

  _play() {
    this.sound.play(() => {
      console.log('playing sound:', this.sound);
      this.interval = setInterval(() => console.log("this.sound.currentTime:", this.sound.currentTime), 500);
      this.setState({isPlaying: true})
    })
  }

  _record() {
    this.currentSoundId = uuidv4();
    this.currentFilename = `${this.currentSoundId}.aac`;

    // Create recording instance with unique filename
    this.recording = new Recorder(this.currentFilename)

    this.recording.record(() => {
      console.log('recording sound:', this.recording);
      this.interval = setInterval(() => console.log("this.recording.isRecording", this.recording.isRecording), 500);
      this.setState({isRecording: true});
    });
  }

  _stop() {
    if (this.state.isRecording) {
      this.recording.stop(() => {
        console.log('stopped recording sound:', this.recording);
        clearInterval(this.interval)
        this.setState({isRecording: false})

        // Then create sound from newly made recording
        this.sound = new Sound(this.recording.fsPath, '', (error) => {
          if (error) {
            console.log('failed to load the sound', error);
            return;
          }
          // loaded successfully
          console.log('duration in seconds: ' + this.sound.getDuration() + 'number of channels: ' + this.sound.getNumberOfChannels());
        });
      })


    } else if (this.state.isPlaying) {
      this.sound.stop(() => {
        console.log('stopped playing sound', this.sound);
        clearInterval(this.interval)
        this.setState({isPlaying: false})
      })
    }
  }


  render() {
    const iconSize = 48;
    const colorOff = '#545454';

    return (
      <View style={styles.main}>

        <View style={styles.buttonWrapper}>
          <ControlButton
            type="PLAY"
            specificFunction={this.state.isPlaying ? this._pause : this._play}
            icon={(<Icon
              name={this.state.isPlaying ? "pause" : "play"}
              size={iconSize}
            />)}
            colorOn="#0f0"
            colorOff={colorOff}
            isOn={this.state.isPlaying}
          />
          <ControlButton
            type="REC"
            specificFunction={this._record}
            icon={(<Icon
              name="circle"
              size={iconSize}
            />)}
            colorOn="#f00"
            colorOff={colorOff}
            isOn={this.state.isRecording}
          />
          <ControlButton
            type="STOP"
            specificFunction={this._stop}
            icon={(<Icon
              name="stop"
              size={iconSize}
            />)}
            colorOn="#00f"
            colorOff={colorOff}
            isOn={false}
          />
        </View>

      </View>
    )
  }
}
