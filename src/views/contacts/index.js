import React, { Component } from "react";
import Header from "../../components/Header";
import AddContact from "./AddContact";
import FloatButton from "../../components/FloatButton";
import {
  Container,
  Content,
  List,
  ListItem,
  Left,
  Right,
  Text,
  Icon
} from "native-base";
import { selectedChat } from "../../store/chats";
import { getSelectedColor, unSelect, getIcon } from "../../utils/utils";
import { Image, StyleSheet, Alert } from "react-native";
import {
  saveContact,
  getContacts,
  deleteContactAction,
  editContats
} from "../../store/contacts";

import { connect } from "react-redux";

/**
 *
 * @class Contacts
 * @description main component of contacts
 * @extends {Component}
 *
 */

class Contacts extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openModal: false,
      selected: []
    };
  }
  static navigationOptions = {
    header: null
  };

  openModal = () => {
    this.setState({ openModal: true });
  };

  closeModal = () => {
    this.setState({ openModal: false });
  };

  onSelect = (contact, chat) => {
    if (this.state.selected.length === 0) {
      this.props.selectedChat(chat);
      this.props.navigation.push("chat", {
        ...contact
      });
      return;
    }

    const selected = unSelect(this.state.selected, contact);

    if (selected.found) {
      this.setState({ selected: selected.data });
    } else {
      this.setState({
        selected: this.state.selected.concat(contact)
      });
    }
  };

  getContactChat = contact => {
    const result = Object.values(this.props.chat).find(chat => {
      return chat.toUID === contact.hashUID;
    });

    return result;
  };

  search = text => {
    this.setState({ search: text });
  };

  deleteContact = () => {
    Alert.alert(
      "Eliminar Contactos",
      "¿Esta seguro de eliminar este contacto?",
      [
        {
          text: "Cancel",
          onPress: () => this.setState({ selected: [] }),
          style: "cancel"
        },
        {
          text: "OK",
          onPress: () =>
            this.props.deleteContact(this.state.selected, () => {
              this.setState({ selected: [] });
            })
        }
      ],
      { cancelable: false }
    );
  };

  editContact = () => {
    this.openModal();
  };

  seleted = data => {
    const selected = unSelect(this.state.selected, data);

    if (!selected.found) {
      this.setState({
        selected: this.state.selected.concat(data)
      });
    }
  };

  closeSelected = () => {
    this.setState({ selected: [] });
  };

  render() {
    const result = this.state.search
      ? this.props.contacts.filter(contact => {
          return contact.name
            .toLowerCase()
            .includes(this.state.search.toLowerCase());
        })
      : this.props.contacts;
    return (
      <Container>
        <Header
          {...this.props}
          back={this.closeSelected}
          selected={this.state.selected}
          modal={this.state.openModal}
          delete={this.deleteContact}
          edit={this.editContact}
          search={this.search}
        />
        {this.state.openModal && (
          <AddContact {...this.props} close={this.closeModal} {...this.state} />
        )}

        <Content>
          {result.map((contact, key) => {
            const chatInfo = this.getContactChat(contact);
            const backgroundColor = getSelectedColor(
              this.state.selected,
              contact.uid
            );
            return (
              <List key={key} style={{ backgroundColor: backgroundColor }}>
                <ListItem
                  button
                  style={{ height: 80 }}
                  onPress={() => this.onSelect(contact, chatInfo)}
                  onLongPress={() => this.seleted(contact)}
                >
                  <Left style={styles.textContainer}>
                    <Text style={{ width: "100%", paddingBottom: 5 }}>
                      {contact.name}
                    </Text>
                    <Text note>
                      {`${contact.uid}`.length > 25
                        ? `${contact.uid}`.substr(0, 25) + `...`
                        : contact.uid}
                    </Text>
                  </Left>
                  <Right>
                    {contact.picture && (
                      <Image
                        style={styles.imageStyles}
                        source={{
                          uri: contact.picture,
                          cache: "force-cache"
                        }}
                      />
                    )}
                    {!contact.picture && (
                      <Image
                        style={styles.imageStyles}
                        source={{
                          uri: `${getIcon(contact.hashUID)}`
                        }}
                      />
                    )}
                  </Right>
                </ListItem>
              </List>
            );
          })}
        </Content>
        {this.state.selected.length < 1 && (
          <FloatButton
            add={this.openModal}
            icon={
              <Icon
                type="MaterialIcons"
                name="person-add"
                style={{ fontSize: 24, color: "#f5f5f5" }}
              />
            }
          />
        )}
      </Container>
    );
  }
}

const mapStateToProps = state => ({
  contacts: Object.values(state.contacts.contacts),
  chat: state.chats.chat,
  userData: state.config
});

export default connect(
  mapStateToProps,
  {
    saveContact,
    getContacts,
    selectedChat,
    deleteContact: deleteContactAction,
    editContats
  }
)(Contacts);

const styles = StyleSheet.create({
  imageStyles: {
    width: 60,
    height: 60,
    borderRadius: 100
  },
  textContainer: {
    flexWrap: "wrap"
  },
  centerText: {
    flex: 1,
    fontSize: 18,
    padding: 32,
    color: "#777"
  },
  textBold: {
    fontWeight: "500",
    color: "#000"
  },
  buttonText: {
    fontSize: 21,
    color: "rgb(0,122,255)"
  },
  buttonTouchable: {
    padding: 16
  }
});
