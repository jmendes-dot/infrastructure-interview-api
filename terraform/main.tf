provider "kind" {}

resource "kind_cluster" "interview" {
  name           = var.cluster_name
  node_image     = var.kind_node_image
  wait_for_ready = true

  kind_config {
    kind        = "Cluster"
    api_version = "kind.x-k8s.io/v1alpha4"

    node {
      role = "control-plane"

      extra_port_mappings {
        container_port = 30080
        host_port      = var.api_host_port
        listen_address = "127.0.0.1"
        protocol       = "TCP"
      }
    }

    node {
      role = "worker"
      kubeadm_config_patches = [<<-YAML
        kind: JoinConfiguration
        nodeRegistration:
          kubeletExtraArgs:
            node-labels: "topology.kubernetes.io/zone=local-zone-a"
        YAML
      ]
    }

    node {
      role = "worker"
      kubeadm_config_patches = [<<-YAML
        kind: JoinConfiguration
        nodeRegistration:
          kubeletExtraArgs:
            node-labels: "topology.kubernetes.io/zone=local-zone-b"
        YAML
      ]
    }

    node {
      role = "worker"
      kubeadm_config_patches = [<<-YAML
        kind: JoinConfiguration
        nodeRegistration:
          kubeletExtraArgs:
            node-labels: "topology.kubernetes.io/zone=local-zone-c"
        YAML
      ]
    }
  }
}
