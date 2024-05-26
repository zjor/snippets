package lib

import (
	"fmt"
	mqtt "github.com/eclipse/paho.mqtt.golang"
	"github.com/spf13/viper"
	"log"
)

func CreateMessageHandler(c chan mqtt.Message) mqtt.MessageHandler {
	return func(client mqtt.Client, msg mqtt.Message) {
		log.Printf("<= [%s] %s", msg.Topic(), msg.Payload())
		c <- msg
	}
}

func Subscribe(topic string, handler mqtt.MessageHandler) {
	opts := mqtt.NewClientOptions()

	broker := fmt.Sprintf("ssl://%s:%d", viper.GetString("MQTT_HOST"), viper.GetInt("MQTT_PORT"))
	log.Printf("Connecting to broker: %s", broker)
	opts.AddBroker(broker)
	opts.SetProtocolVersion(5)
	opts.SetClientID("go-youtrack")
	opts.SetUsername(viper.GetString("MQTT_USER"))
	opts.SetPassword(viper.GetString("MQTT_PASSWORD"))

	opts.SetDefaultPublishHandler(handler)

	client := mqtt.NewClient(opts)
	if token := client.Connect(); token.Wait() && token.Error() != nil {
		panic(token.Error())
	}

	if token := client.Subscribe(topic, 0, nil); token.Wait() && token.Error() != nil {
		panic(token.Error())
	}

	fmt.Printf("Subscribed to topic: %s\n", topic)
}
