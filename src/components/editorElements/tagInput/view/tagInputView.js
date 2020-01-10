import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
// Constants

// Components
import { TextInput } from '../../../textInput';

// Styles
import styles from './tagInputStyles';
import globalStyles from '../../../../globalStyles';

const TagInput = ({
  value,
  onChange,
  handleIsValid,
  componentID,
  handleTagChanged,
  intl,
  isPreviewActive,
  autoFocus,
}) => {
  const [text, setText] = useState('');
  const [warning, setWarning] = useState(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (typeof value === 'string') {
      setText(value);
    } else {
      setText(value.join(' '));
    }
  }, [value]);

  // Component Functions
  const _handleOnChange = _text => {
    setText(_text.replace(/,/g, ' ').replace(/#/g, ''));

    let cats = _text.split(' ');
    if (handleTagChanged && cats.length > 0) {
      cats.length > 10
        ? (setWarning(intl.formatMessage({ id: 'editor.limited_tags' })), setHeight(60))
        : cats.find(c => c.length > 24)
        ? (setWarning(intl.formatMessage({ id: 'editor.limited_length' })), setHeight(60))
        : cats.find(c => c.split('-').length > 2)
        ? (setWarning(intl.formatMessage({ id: 'editor.limited_dash' })), setHeight(60))
        : cats.find(c => c.indexOf(',') >= 0)
        ? (setWarning(intl.formatMessage({ id: 'editor.limited_space' })), setHeight(60))
        : cats.find(c => /[A-Z]/.test(c))
        ? (setWarning(intl.formatMessage({ id: 'editor.limited_lowercase' })), setHeight(60))
        : cats.find(c => !/^[a-z0-9-#]+$/.test(c))
        ? (setWarning(intl.formatMessage({ id: 'editor.limited_characters' })), setHeight(60))
        : cats.find(c => !/^[a-z-#]/.test(c))
        ? (setWarning(intl.formatMessage({ id: 'editor.limited_firstchar' })), setHeight(60))
        : cats.find(c => !/[a-z0-9]$/.test(c))
        ? (setWarning(intl.formatMessage({ id: 'editor.limited_lastchar' })), setHeight(60))
        : setWarning(null);

      handleTagChanged([...cats]);
    }

    if (handleIsValid) {
      handleIsValid(componentID, !!(_text && _text.length));
    }
  };
  const _handleOnBlur = () => {
    if (onChange) {
      let cats = text.trim().split(' ');
      if (handleTagChanged && cats.length > 0) {
        cats.length > 10
          ? (setWarning(intl.formatMessage({ id: 'editor.limited_tags' })), setHeight(60))
          : cats.find(c => c.length > 24)
          ? (setWarning(intl.formatMessage({ id: 'editor.limited_length' })), setHeight(60))
          : cats.find(c => c.split('-').length > 2)
          ? (setWarning(intl.formatMessage({ id: 'editor.limited_dash' })), setHeight(60))
          : cats.find(c => c.indexOf(',') >= 0)
          ? (setWarning(intl.formatMessage({ id: 'editor.limited_space' })), setHeight(60))
          : cats.find(c => /[A-Z]/.test(c))
          ? (setWarning(intl.formatMessage({ id: 'editor.limited_lowercase' })), setHeight(60))
          : cats.find(c => !/^[a-z0-9-#]+$/.test(c))
          ? (setWarning(intl.formatMessage({ id: 'editor.limited_characters' })), setHeight(60))
          : cats.find(c => !/^[a-z-#]/.test(c))
          ? (setWarning(intl.formatMessage({ id: 'editor.limited_firstchar' })), setHeight(60))
          : cats.find(c => !/[a-z0-9]$/.test(c))
          ? (setWarning(intl.formatMessage({ id: 'editor.limited_lastchar' })), setHeight(60))
          : setWarning(null);
        handleTagChanged([...cats]);
      }
      onChange(text);
    }

    if (handleIsValid) {
      handleIsValid(componentID, !!(text && text.length));
    }
  };
  return (
    <View style={[globalStyles.containerHorizontal16, { height: Math.max(35, height) }]}>
      <TextInput
        style={[styles.textInput, { height: Math.max(35, height) }]}
        placeholderTextColor="#c1c5c7"
        editable={!isPreviewActive}
        maxLength={100}
        placeholder={intl.formatMessage({
          id: 'editor.tags',
        })}
        multiline
        numberOfLines={2}
        onContentSizeChange={event => {
          setHeight(event.nativeEvent.contentSize.height);
        }}
        autoFocus={autoFocus}
        onChangeText={textT => _handleOnChange(textT)}
        onBlur={() => _handleOnBlur()}
        value={text}
      />
      {warning && <Text style={styles.warning}>{warning}</Text>}
    </View>
  );
};

export default TagInput;
